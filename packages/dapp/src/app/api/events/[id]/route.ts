import { NextRequest } from 'next/server';
import { getEventsCollection, getOrganizersCollection, getArtistsOnEventsCollection } from '@/models/CollectionAccess';
import { Event, ArtistOnEvent } from '@/models/index';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const eventsCollection = await getEventsCollection();
    const organizersCollection = await getOrganizersCollection();
    const artistsOnEventsCollection = await getArtistsOnEventsCollection();

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
  } catch (error) {
    console.error('Error fetching event:', error);
    return Response.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updateData = await request.json();
    
    const eventsCollection = await getEventsCollection();
    
    // Update the event
    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return Response.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    return Response.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const eventsCollection = await getEventsCollection();
    
    const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return Response.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return Response.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}