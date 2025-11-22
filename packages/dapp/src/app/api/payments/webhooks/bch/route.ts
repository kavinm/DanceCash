import { NextRequest } from 'next/server';
import { getBCHPaymentSessionsCollection, getCheckoutSessionsCollection, getTicketsCollection } from '@/models/CollectionAccess';
import { Ticket } from '@/models/index';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const bchPaymentSessionsCollection = await getBCHPaymentSessionsCollection();
    const checkoutSessionsCollection = await getCheckoutSessionsCollection();
    const ticketsCollection = await getTicketsCollection();
    
    // In a real app, this would receive a webhook from a BCH payment processor
    // For this example, we'll simulate a webhook with the required data
    const body = await request.json();
    const { txId, address, amount, confirmations = 0 } = body;
    
    if (!txId || !address || amount === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find the payment session by address
    const paymentSession = await bchPaymentSessionsCollection.findOne({ 
      address: address,
      status: 'pending'
    });
    
    if (!paymentSession) {
      return Response.json({ error: 'Payment session not found or already processed' }, { status: 404 });
    }
    
    // Update the payment session with transaction info
    await bchPaymentSessionsCollection.updateOne(
      { _id: new ObjectId(paymentSession._id) },
      {
        $set: {
          transactionId: txId,
          status: confirmations >= 1 ? 'confirmed' : 'pending',
          confirmations,
          updatedAt: new Date()
        }
      }
    );
    
    // Find and update the checkout session
    const checkoutSession = await checkoutSessionsCollection.findOne({ 
      _id: new ObjectId(paymentSession.checkoutSessionId) 
    });
    
    if (!checkoutSession) {
      return Response.json({ error: 'Checkout session not found' }, { status: 404 });
    }
    
    // Update checkout session status
    await checkoutSessionsCollection.updateOne(
      { _id: new ObjectId(paymentSession.checkoutSessionId) },
      {
        $set: {
          status: confirmations >= 1 ? 'completed' : 'pending',
          updatedAt: new Date()
        }
      }
    );
    
    // If payment is confirmed, create the ticket
    if (confirmations >= 1) {
      // Create the ticket record
      const newTicket: Ticket = {
        eventId: checkoutSession.eventId,
        ticketTypeId: checkoutSession.ticketTypeId,
        userId: checkoutSession.userId,
        status: 'active',
        purchaseDate: new Date(),
        transactionId: txId,
        paymentMethod: 'bch',
        pricePaid: checkoutSession.totalAmount,
        pricePaidBCH: checkoutSession.totalAmountBCH,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await ticketsCollection.insertOne(newTicket);
    }
    
    return Response.json({ 
      message: 'Webhook processed successfully', 
      paymentStatus: confirmations >= 1 ? 'confirmed' : 'pending',
      ticketCreated: confirmations >= 1
    });
  } catch (error) {
    console.error('Error processing BCH payment webhook:', error);
    return Response.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}