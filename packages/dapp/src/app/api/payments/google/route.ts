import { NextRequest } from 'next/server';
import { googleWalletService } from '@/lib/payment/GoogleWalletService';
import { getCheckoutSessionsCollection, getEventsCollection } from '@/models/CollectionAccess';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    if (!googleWalletService.isConfigured()) {
      return Response.json({ error: 'Google Wallet is not properly configured' }, { status: 500 });
    }

    const checkoutSessionsCollection = await getCheckoutSessionsCollection();
    const eventsCollection = await getEventsCollection();
    
    const body = await request.json();
    const { checkoutSessionId, userId, dancerName } = body;
    
    if (!checkoutSessionId || !userId) {
      return Response.json({ error: 'Missing required fields: checkoutSessionId, userId' }, { status: 400 });
    }

    // Get the checkout session
    const checkoutSession = await checkoutSessionsCollection.findOne({ 
      _id: new ObjectId(checkoutSessionId) 
    });
    
    if (!checkoutSession) {
      return Response.json({ error: 'Checkout session not found' }, { status: 404 });
    }

    // Get event details
    const event = await eventsCollection.findOne({ 
      _id: new ObjectId(checkoutSession.eventId) 
    });
    
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Create Google Wallet ticket
    const ticketData = {
      eventId: checkoutSession.eventId,
      userId: userId,
      eventName: event.title,
      eventDate: event.date.toISOString(),
      venue: `${event.venue}, ${event.location.city}, ${event.location.state}`,
      ticketType: 'General Admission', // Would come from ticket type in a real app
      ticketNumber: `T${Date.now()}`, // Generate a unique ticket number
      confirmationCode: `CONF${Math.random().toString(36).substr(2, 9).toUpperCase()}`, // Generate confirmation code
      dancerName: dancerName || 'Dancer'
    };

    const googleTicket = await googleWalletService.createEventTicketObject(ticketData);

    // In a real app, we might store the Google Wallet object ID in our database
    // For now, we'll just return the Google Pay URL
    const googlePayUrl = googleWalletService.generateGooglePayUrl(googleTicket.id);

    return Response.json({ 
      message: 'Google Wallet ticket created', 
      googleTicketId: googleTicket.id,
      googlePayUrl,
      ticket: googleTicket
    });
  } catch (error) {
    console.error('Error creating Google Wallet ticket:', error);
    return Response.json({ error: 'Failed to create Google Wallet ticket' }, { status: 500 });
  }
}