import { 
  getEventsCollection, 
  getOrganizersCollection, 
  getArtistsCollection, 
  getTicketsCollection, 
  getArtistsOnEventsCollection,
  getTicketTypesCollection,
  getNFTRicketRecordsCollection,
  getCashbackRecordsCollection,
  getUsersCollection
} from '@/models/CollectionAccess';
import { 
  Event, 
  Organizer, 
  Artist, 
  Ticket, 
  ArtistOnEvent, 
  TicketType,
  NFTRicketRecord,
  CashbackRecord,
  User
} from '@/models/index';
import { ObjectId } from 'mongodb';

// Service for handling Event relationships
export class EventService {
  // Get an event with all its related data
  static async getEventWithRelationships(eventId: string) {
    const eventsCollection = await getEventsCollection();
    const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    
    if (!event) return null;
    
    // Get organizer details
    const organizersCollection = await getOrganizersCollection();
    const organizer = await organizersCollection.findOne({ userId: event.organizerId });
    
    // Get artists for this event
    const artistsOnEventsCollection = await getArtistsOnEventsCollection();
    const artistsOnEvent = await artistsOnEventsCollection.find({ eventId: eventId }).toArray();
    
    const artistsCollection = await getArtistsCollection();
    const artistDetails = await Promise.all(
      artistsOnEvent.map(async (aoe) => {
        const artist = await artistsCollection.findOne({ userId: aoe.artistId });
        return { ...aoe, artist: { name: artist?.name, bio: artist?.bio } };
      })
    );
    
    // Get ticket types for this event
    const ticketTypesCollection = await getTicketTypesCollection();
    const ticketTypes = await ticketTypesCollection.find({ eventId: eventId }).toArray();
    
    return {
      ...event,
      organizer: { name: organizer?.name, organizationName: organizer?.organizationName },
      artists: artistDetails,
      ticketTypes
    };
  }

  // Create an event with its relationships
  static async createEventWithRelationships(eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>, artistIds?: string[]) {
    const eventsCollection = await getEventsCollection();
    
    const newEvent: Event = {
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await eventsCollection.insertOne(newEvent);
    
    // If artist IDs are provided, create the relationships
    if (artistIds && artistIds.length > 0) {
      const artistsOnEventsCollection = await getArtistsOnEventsCollection();
      const relationships = artistIds.map(artistId => ({
        eventId: result.insertedId.toString(),
        artistId,
        role: 'instructor', // Default role
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await artistsOnEventsCollection.insertMany(relationships);
    }
    
    return { ...newEvent, _id: result.insertedId };
  }

  // Get events for an organizer
  static async getEventsForOrganizer(organizerId: string, status?: string) {
    const eventsCollection = await getEventsCollection();
    const query: any = { organizerId };
    
    if (status) {
      query.status = status;
    }
    
    return await eventsCollection.find(query).sort({ date: 1 }).toArray();
  }
}

// Service for handling Artist relationships
export class ArtistService {
  // Get an artist with their event history
  static async getArtistWithEvents(artistId: string) {
    const artistsCollection = await getArtistsCollection();
    const artist = await artistsCollection.findOne({ userId: artistId });
    
    if (!artist) return null;
    
    // Get events this artist is part of
    const artistsOnEventsCollection = await getArtistsOnEventsCollection();
    const eventsOnArtist = await artistsOnEventsCollection.find({ artistId: artistId }).toArray();
    
    const eventsCollection = await getEventsCollection();
    const events = await Promise.all(
      eventsOnArtist.map(async (aoe) => {
        const event = await eventsCollection.findOne({ _id: new ObjectId(aoe.eventId) });
        return { ...aoe, event: { title: event?.title, date: event?.date } };
      })
    );
    
    return { ...artist, events };
  }

  // Get artists for an event
  static async getArtistsForEvent(eventId: string) {
    const artistsOnEventsCollection = await getArtistsOnEventsCollection();
    const artistsOnEvent = await artistsOnEventsCollection.find({ eventId: eventId }).toArray();
    
    const artistsCollection = await getArtistsCollection();
    const artists = await Promise.all(
      artistsOnEvent.map(async (aoe) => {
        const artist = await artistsCollection.findOne({ userId: aoe.artistId });
        return { ...aoe, artist };
      })
    );
    
    return artists;
  }
}

// Service for handling Ticket relationships
export class TicketService {
  // Get a ticket with its related data
  static async getTicketWithRelationships(ticketId: string) {
    const ticketsCollection = await getTicketsCollection();
    const ticket = await ticketsCollection.findOne({ _id: new ObjectId(ticketId) });
    
    if (!ticket) return null;
    
    // Get event details
    const eventsCollection = await getEventsCollection();
    const event = await eventsCollection.findOne({ _id: new ObjectId(ticket.eventId) });
    
    // Get user details
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ userId: ticket.userId });
    
    // Get ticket type details
    const ticketTypesCollection = await getTicketTypesCollection();
    const ticketType = await ticketTypesCollection.findOne({ _id: new ObjectId(ticket.ticketTypeId) });
    
    return {
      ...ticket,
      event: { title: event?.title, date: event?.date, venue: event?.venue },
      user: { name: user?.name, email: user?.email },
      ticketType: { name: ticketType?.name, price: ticketType?.price }
    };
  }

  // Get tickets for a user
  static async getTicketsForUser(userId: string) {
    const ticketsCollection = await getTicketsCollection();
    const tickets = await ticketsCollection.find({ userId }).sort({ purchaseDate: -1 }).toArray();
    
    const eventsCollection = await getEventsCollection();
    const ticketWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await eventsCollection.findOne({ _id: new ObjectId(ticket.eventId) });
        return { ...ticket, event: { title: event?.title, date: event?.date, venue: event?.venue } };
      })
    );
    
    return ticketWithEvents;
  }

  // Get tickets for an event
  static async getTicketsForEvent(eventId: string) {
    const ticketsCollection = await getTicketsCollection();
    return await ticketsCollection.find({ eventId }).sort({ purchaseDate: 1 }).toArray();
  }
}

// Service for handling NFT and Cashback relationships
export class TokenService {
  // Get NFT tickets for a user
  static async getNFTRicketsForUser(userId: string) {
    const nftCollection = await getNFTRicketRecordsCollection();
    return await nftCollection.find({ userId }).toArray();
  }

  // Get cashback records for a user
  static async getCashbackForUser(userId: string) {
    const cashbackCollection = await getCashbackRecordsCollection();
    return await cashbackCollection.find({ userId }).toArray();
  }

  // Get all related tokens (NFT tickets and cashback) for a user
  static async getAllTokensForUser(userId: string) {
    const nftTickets = await this.getNFTRicketsForUser(userId);
    const cashbackRecords = await this.getCashbackForUser(userId);
    
    return {
      nftTickets,
      cashbackRecords
    };
  }
}

// Service for handling User relationships
export class UserService {
  // Get user with their tickets
  static async getUserWithTickets(userId: string) {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ userId });
    
    if (!user) return null;
    
    const tickets = await TicketService.getTicketsForUser(userId);
    
    return {
      ...user,
      tickets
    };
  }
}