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
declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');
    const wallet = searchParams.get('wallet');
    const eventId = searchParams.get('eventId');

    const db = (await clientPromise).db('dancecash');
    const registrationsCollection = db.collection('registrations');

    if (registrationId) {
      const registration = await registrationsCollection.findOne({ _id: new ObjectId(registrationId) });
      if (!registration) {
        return Response.json({ error: 'Registration not found' }, { status: 404 });
      }
      return Response.json({ registration });
    }

    const query: Record<string, any> = {};
    if (wallet) {
      query.userWallet = wallet;
    }
    if (eventId) {
      query.eventId = eventId;
    }

    const registrations = await registrationsCollection.find(query).toArray();
    return Response.json({ registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return Response.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = (await clientPromise).db('dancecash');
    const registrationsCollection = db.collection('registrations');
    const eventsCollection = db.collection('events');

    const body = await request.json();

    // Validate required fields
    if (!body.eventId || !body.name || !body.email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const registration = {
      ...body,
      createdAt: new Date(),
    };

    // Insert the registration document
    const result = await registrationsCollection.insertOne(registration);

    // Increment the currentlyRegistered count on the event
    await eventsCollection.updateOne(
      { _id: new ObjectId(body.eventId) },
      { $inc: { currentlyRegistered: 1 } }
    );

    return Response.json({
      message: 'Registration successful',
      registrationId: result.insertedId.toString(),
      registration: { ...registration, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return Response.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}