import connectToDatabase from "@/lib/database/connection";
import { User, Organizer, Artist, Event, TicketType, Ticket, CheckoutSession, BCHPaymentSession, NFTRicketRecord, CashbackRecord, ArtistOnEvent, EventCategory } from "./index";

// User collection operations
export async function getUsersCollection() {
  const db = await connectToDatabase();
  return db.collection<User>("users");
}

export async function getOrganizersCollection() {
  const db = await connectToDatabase();
  return db.collection<Organizer>("organizers");
}

export async function getArtistsCollection() {
  const db = await connectToDatabase();
  return db.collection<Artist>("artists");
}

// Event collection operations
export async function getEventsCollection() {
  const db = await connectToDatabase();
  return db.collection<Event>("events");
}

// Ticket collection operations
export async function getTicketTypesCollection() {
  const db = await connectToDatabase();
  return db.collection<TicketType>("ticketTypes");
}

export async function getTicketsCollection() {
  const db = await connectToDatabase();
  return db.collection<Ticket>("tickets");
}

// Checkout session collection operations
export async function getCheckoutSessionsCollection() {
  const db = await connectToDatabase();
  return db.collection<CheckoutSession>("checkoutSessions");
}

// BCH Payment session collection operations
export async function getBCHPaymentSessionsCollection() {
  const db = await connectToDatabase();
  return db.collection<BCHPaymentSession>("bchPaymentSessions");
}

// NFT Ticket collection operations
export async function getNFTRicketRecordsCollection() {
  const db = await connectToDatabase();
  return db.collection<NFTRicketRecord>("nftTicketRecords");
}

// Cashback collection operations
export async function getCashbackRecordsCollection() {
  const db = await connectToDatabase();
  return db.collection<CashbackRecord>("cashbackRecords");
}

// Artist on Event collection operations
export async function getArtistsOnEventsCollection() {
  const db = await connectToDatabase();
  return db.collection<ArtistOnEvent>("artistsOnEvents");
}

// Event Category collection operations
export async function getEventCategoriesCollection() {
  const db = await connectToDatabase();
  return db.collection<EventCategory>("eventCategories");
}