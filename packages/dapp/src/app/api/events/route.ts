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
    const id = searchParams.get('id');
    const participant = searchParams.get('participant');
    const organizerId = searchParams.get('organizerId');

    const db = (await clientPromise).db('dancecash');
    const eventsCollection = db.collection('events');
    const registrationsCollection = db.collection('registrations');

    if (id) {
      // Get single event
      const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
      return Response.json(event || { error: 'Event not found' });
    } else if (participant) {
      // Get events the participant has registered for
      const registrations = await registrationsCollection.find({ userId: participant }).toArray();
      const eventIds = registrations.map(reg => new ObjectId(reg.eventId));

      const events = await eventsCollection.find({ _id: { $in: eventIds } }).toArray();
      return Response.json({ events });
    } else if (organizerId) {
      // Get events for a specific organizer
      const events = await eventsCollection.find({ organizerId: organizerId }).toArray();
      return Response.json({ events });
    } else {
      // Get all events
      const events = await eventsCollection.find({}).toArray();
      return Response.json({ events });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = (await clientPromise).db('dancecash');
    const eventsCollection = db.collection('events');

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.date || !body.venue) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create slug from title
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const event = {
      ...body,
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await eventsCollection.insertOne(event);

    return Response.json({
      message: 'Event created successfully',
      eventId: result.insertedId.toString(),
      event: { ...event, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return Response.json({ error: 'Failed to create event' }, { status: 500 });
  }
}