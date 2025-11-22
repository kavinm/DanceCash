import { NextRequest } from 'next/server';
import { getEventsCollection, getOrganizersCollection, getArtistsOnEventsCollection } from '@/models/CollectionAccess';
import { Event, ArtistOnEvent } from '@/models/index';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const organizerId = searchParams.get('organizerId');

    const eventsCollection = await getEventsCollection();
    const organizersCollection = await getOrganizersCollection();
    const artistsOnEventsCollection = await getArtistsOnEventsCollection();

    // If ID or slug is provided, return a single event
    if (id) {
      const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
      if (!event) {
        return Response.json({ error: 'Event not found' }, { status: 404 });
      }
      
      // Get organizer details
      const organizer = await organizersCollection.findOne({ userId: event.organizerId });
      const eventWithOrganizer = { ...event, organizer: { name: organizer?.name, organizationName: organizer?.organizationName } };
      
      // Get artists for this event
      const artistsOnEvent = await artistsOnEventsCollection.find({ eventId: event._id?.toString() }).toArray();
      
      return Response.json({ ...eventWithOrganizer, artistsOnEvent });
    }
    
    // Otherwise return a list of events with pagination and filters
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query: any = { status: 'published' }; // Only return published events
    
    if (slug) query.slug = slug;
    if (category) query.danceStyle = { $regex: new RegExp(category, 'i') };
    if (location) query['location.city'] = { $regex: new RegExp(location, 'i') };
    if (organizerId) query.organizerId = organizerId;
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    const total = await eventsCollection.countDocuments(query);
    const events = await eventsCollection
      .find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // For each event, get the organizer details
    const eventsWithOrganizers = await Promise.all(events.map(async (event) => {
      const organizer = await organizersCollection.findOne({ userId: event.organizerId });
      return { 
        ...event, 
        organizer: { name: organizer?.name, organizationName: organizer?.organizationName } 
      };
    }));
    
    return Response.json({
      events: eventsWithOrganizers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventsCollection = await getEventsCollection();
    const artistsOnEventsCollection = await getArtistsOnEventsCollection();
    
    const body = await request.json();
    const { title, description, date, startTime, venue, location, price, danceStyle, maxCapacity, instructorId, additionalInfo } = body;
    
    // Validate required fields
    if (!title || !date || !venue || !location || price === undefined || !danceStyle || !maxCapacity) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // In a real app, you would verify the user is an organizer
    // For now, we'll use a mock organizer ID
    const mockOrganizerId = 'mock-organizer-id';
    
    // Create slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const newEvent: Event = {
      title,
      slug,
      description: description || '',
      date: new Date(date),
      startTime,
      venue,
      location,
      price,
      danceStyle,
      organizerId: mockOrganizerId,
      maxCapacity: parseInt(maxCapacity),
      currentRegistrations: 0,
      isRecurring: false,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
      additionalInfo: additionalInfo || '',
    };
    
    const result = await eventsCollection.insertOne(newEvent);
    
    // If instructorId is provided, create the ArtistOnEvent relationship
    if (instructorId) {
      const artistOnEvent: ArtistOnEvent = {
        eventId: result.insertedId.toString(),
        artistId: instructorId,
        role: 'instructor',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await artistsOnEventsCollection.insertOne(artistOnEvent);
    }
    
    return Response.json({ 
      message: 'Event created successfully', 
      eventId: result.insertedId.toString(),
      event: { ...newEvent, _id: result.insertedId } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return Response.json({ error: 'Failed to create event' }, { status: 500 });
  }
}