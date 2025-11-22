import { NextRequest } from 'next/server';
import { getTicketsCollection, getEventsCollection, getNFTRicketRecordsCollection, getCashbackRecordsCollection } from '@/models/CollectionAccess';
import { Ticket, NFTRicketRecord, CashbackRecord } from '@/models/index';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const ticketId = searchParams.get('ticketId');

    const ticketsCollection = await getTicketsCollection();
    const eventsCollection = await getEventsCollection();

    // If a specific ticket ID is provided, return that ticket
    if (ticketId) {
      const ticket = await ticketsCollection.findOne({ _id: new ObjectId(ticketId) });
      if (!ticket) {
        return Response.json({ error: 'Ticket not found' }, { status: 404 });
      }
      
      // Get event details for the ticket
      const event = await eventsCollection.findOne({ _id: new ObjectId(ticket.eventId) });
      
      return Response.json({ ...ticket, event: { title: event?.title, date: event?.date } });
    }
    
    // Otherwise, return tickets for a user or event
    const query: any = {};
    if (userId) query.userId = userId;
    if (eventId) query.eventId = eventId;
    
    if (Object.keys(query).length === 0) {
      return Response.json({ error: 'Either userId or eventId must be provided' }, { status: 400 });
    }
    
    const tickets = await ticketsCollection
      .find(query)
      .sort({ purchaseDate: -1 })
      .toArray();
    
    // For each ticket, get the event details
    const ticketsWithEvents = await Promise.all(tickets.map(async (ticket) => {
      const event = await eventsCollection.findOne({ _id: new ObjectId(ticket.eventId) });
      return { 
        ...ticket, 
        event: { title: event?.title, date: event?.date, venue: event?.venue } 
      };
    }));
    
    return Response.json({ tickets: ticketsWithEvents });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return Response.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ticketsCollection = await getTicketsCollection();
    const nftTicketRecordsCollection = await getNFTRicketRecordsCollection();
    const cashbackRecordsCollection = await getCashbackRecordsCollection();
    
    const body = await request.json();
    const { eventId, ticketTypeId, userId, status, pricePaid, pricePaidBCH, transactionId, paymentMethod, ticketTokenId } = body;
    
    // Validate required fields
    if (!eventId || !ticketTypeId || !userId || !pricePaid || !paymentMethod) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create the ticket
    const newTicket: Ticket = {
      eventId,
      ticketTypeId,
      userId,
      status: status || 'active',
      purchaseDate: new Date(),
      transactionId,
      paymentMethod,
      pricePaid,
      pricePaidBCH,
      ticketTokenId, // This would come from the CashToken creation
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const ticketResult = await ticketsCollection.insertOne(newTicket);
    
    // If this is a confirmed payment and we have a token ID, create NFT ticket record
    if (transactionId && ticketTokenId) {
      const nftTicketRecord: NFTRicketRecord = {
        tokenId: ticketTokenId,
        eventId,
        userId,
        commitment: `ticket:${ticketResult.insertedId.toString()}`, // Unique commitment for this ticket
        txId: transactionId,
        walletAddress: '', // Would be populated with user's wallet address
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await nftTicketRecordsCollection.insertOne(nftTicketRecord);
      
      // Create a cashback record (10% of ticket price as cashback tokens)
      const cashbackAmount = Math.floor(pricePaid * 0.1 * 1000); // Convert to satoshis using $1 = 1000 sat conversion
      
      const cashbackRecord: CashbackRecord = {
        eventId,
        userId,
        tokenId: `cashback_${Date.now()}`, // In a real app, this would be an actual token ID
        amount: cashbackAmount,
        txId: transactionId,
        walletAddress: '', // Would be populated with user's wallet address
        claimStatus: 'available',
        claimExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await cashbackRecordsCollection.insertOne(cashbackRecord);
    }
    
    return Response.json({ 
      message: 'Ticket created successfully', 
      ticketId: ticketResult.insertedId.toString(),
      ticket: { ...newTicket, _id: ticketResult.insertedId } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return Response.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}