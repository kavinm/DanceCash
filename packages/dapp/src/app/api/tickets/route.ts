import { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dancecash:hi7Cj0Xk0Nt2iSR8@cluster0.5tgaxcl.mongodb.net/?appName=Cluster0';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// Global variable to store the client promise 
// (This helps with Vercel's serverless function limitations)  
declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet') || searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const tokenIdsParam = searchParams.get('tokenIds');
    
    const db = (await clientPromise).db('dancecash');
    const ticketsCollection = db.collection('registrations'); // Using registrations as tickets collection
    
    const query: Record<string, any> = {};
    if (wallet) {
      query.userWallet = wallet;
    }
    if (eventId) {
      query.eventId = eventId;
    }
    if (tokenIdsParam) {
      const tokenIds = tokenIdsParam
        .split(',')
        .map((tokenId) => tokenId.trim())
        .filter(Boolean);
      if (tokenIds.length) {
        query.nftTokenId = { $in: tokenIds };
      }
    }

    const tickets = await ticketsCollection.find(query).toArray();

    const eventsCollection = db.collection('events');
    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await eventsCollection.findOne({ _id: new ObjectId(ticket.eventId) });
        return {
          ...ticket,
          eventTitle: event?.title,
          eventDate: event?.date,
          venue: event?.venue,
          event,
        };
      })
    );

    return Response.json({ tickets: ticketsWithEvents });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return Response.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = (await clientPromise).db('dancecash');
    const ticketsCollection = db.collection('registrations');
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.eventId || !body.userId) {
      return Response.json({ error: 'Missing required fields: eventId, userId' }, { status: 400 });
    }
    
    const ticket = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await ticketsCollection.insertOne(ticket);
    
    return Response.json({ 
      message: 'Ticket created successfully', 
      ticketId: result.insertedId.toString(),
      ticket: { ...ticket, _id: result.insertedId } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return Response.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}