import { NextRequest } from 'next/server';
import { getCheckoutSessionsCollection, getBCHPaymentSessionsCollection } from '@/models/CollectionAccess';
import { CheckoutSession, BCHPaymentSession } from '@/models/index';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const checkoutSessionsCollection = await getCheckoutSessionsCollection();
    const bchPaymentSessionsCollection = await getBCHPaymentSessionsCollection();
    
    const body = await request.json();
    const { userId, eventId, ticketTypeId, totalAmount, returnUrl, cancelUrl } = body;
    
    // Validate required fields
    if (!userId || !eventId || !ticketTypeId || !totalAmount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Calculate BCH amount (this would be based on current exchange rate in a real app)
    // For demo purposes, use a fixed conversion rate: $1 = 0.0004 BCH (approximate)
    const totalAmountBCH = parseFloat((totalAmount * 0.0004).toFixed(8));
    
    // Generate a unique session token
    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create checkout session
    const checkoutSession: CheckoutSession = {
      userId,
      eventId,
      ticketTypeId,
      status: 'pending',
      totalAmount,
      totalAmountBCH,
      paymentMethod: 'bch',
      sessionToken,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
      returnUrl: returnUrl || '',
      cancelUrl: cancelUrl || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const sessionResult = await checkoutSessionsCollection.insertOne(checkoutSession);
    
    // Create a corresponding BCH payment session
    // In a real app, this would generate a unique BCH address for this payment
    const bchPaymentSession: BCHPaymentSession = {
      checkoutSessionId: sessionResult.insertedId.toString(),
      address: 'bchtest:qrkmn0hu2z7l0mg4593k576a6x8fg52wgcm56d8y6a', // Testnet address - in real app this would be generated
      amount: Math.floor(totalAmountBCH * 100000000), // Convert to satoshis
      amountUSD: totalAmount,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await bchPaymentSessionsCollection.insertOne(bchPaymentSession);
    
    return Response.json({ 
      message: 'BCH payment session created successfully', 
      sessionId: sessionResult.insertedId.toString(),
      sessionToken,
      bchPaymentSession: {
        ...bchPaymentSession,
        _id: (await bchPaymentSessionsCollection.findOne({ checkoutSessionId: sessionResult.insertedId.toString() }))?._id
      },
      totalAmountBCH
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating BCH payment session:', error);
    return Response.json({ error: 'Failed to create BCH payment session' }, { status: 500 });
  }
}