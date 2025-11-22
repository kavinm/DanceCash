// User model (base model for dancers, artists, organizers)
export interface User {
  _id?: string;
  userId: string; // Unique identifier (could be wallet address)
  name: string;
  email: string;
  phone?: string;
  role: 'dancer' | 'artist' | 'organizer'; // user type
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Organizer model (extending User)
export interface Organizer extends User {
  organizationName?: string;
  businessLicense?: string;
  description?: string;
  profileImage?: string;
  verified: boolean;
}

// Artist model (extending User)
export interface Artist extends User {
  bio?: string;
  socialLinks?: string[];
  profileImage?: string;
  danceStyles: string[];
  experienceYears: number;
  rating?: number;
  verified: boolean;
}

// Event model
export interface Event {
  _id?: string;
  title: string;
  slug: string; // URL-friendly identifier
  description: string;
  date: Date;
  startTime: string; // e.g. "19:00"
  endTime?: string;
  venue: string;
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  price: number; // in USD
  priceBCH?: number; // in BCH (with discount)
  danceStyle: string;
  organizerId: string; // Reference to Organizer
  maxCapacity: number;
  currentRegistrations: number;
  isRecurring: boolean;
  recurrencePattern?: string; // e.g. "weekly", "monthly", "custom"
  thumbnailImage: string;
  bannerImage?: string;
  instructorId?: string; // Reference to Artist
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  additionalInfo?: string;
}

// Ticket Types model
export interface TicketType {
  _id?: string;
  eventId: string; // Reference to Event
  name: string; // e.g. "General", "VIP", "Student"
  price: number; // in USD
  priceBCH?: number; // in BCH (with discount)
  availableCount: number;
  maxPerUser?: number;
  salesStart: Date;
  salesEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket model
export interface Ticket {
  _id?: string;
  eventId: string; // Reference to Event
  ticketTypeId: string; // Reference to TicketType
  userId: string; // Reference to User (dancer)
  status: 'active' | 'used' | 'cancelled' | 'refunded';
  purchaseDate: Date;
  ticketTokenId?: string; // Reference to CashToken ID
  transactionId?: string; // BCH payment transaction ID
  paymentMethod: 'bch' | 'fiat';
  pricePaid: number; // in USD
  pricePaidBCH?: number; // in BCH
  qrCode?: string; // QR code data for ticket
  createdAt: Date;
  updatedAt: Date;
}

// Checkout Session model
export interface CheckoutSession {
  _id?: string;
  userId: string; // Reference to User
  eventId: string; // Reference to Event
  ticketTypeId: string; // Reference to TicketType
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  totalAmount: number; // in USD
  totalAmountBCH?: number; // in BCH
  paymentMethod: 'bch' | 'fiat';
  sessionToken: string; // Unique session identifier
  expiresAt: Date;
  returnUrl?: string;
  cancelUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// BCH Payment Session model
export interface BCHPaymentSession {
  _id?: string;
  checkoutSessionId: string; // Reference to CheckoutSession
  address: string; // BCH address for payment
  amount: number; // Amount in satoshis
  amountUSD: number; // Amount in USD
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  transactionId?: string; // BCH transaction ID when confirmed
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  confirmations?: number;
}

// NFT Ticket Record model
export interface NFTRicketRecord {
  _id?: string;
  tokenId: string; // CashToken ID
  eventId: string; // Reference to Event
  userId: string; // Reference to User
  commitment: string; // Token commitment
  txId: string; // Transaction ID
  walletAddress: string; // Recipient wallet address
  createdAt: Date;
  updatedAt: Date;
}

// Cashback Record model
export interface CashbackRecord {
  _id?: string;
  eventId: string; // Reference to Event
  userId: string; // Reference to User
  tokenId: string; // Cashback token ID
  amount: number; // Cashback amount in satoshis
  txId: string; // Transaction ID
  walletAddress: string; // Recipient wallet address
  claimStatus: 'available' | 'claimed' | 'expired';
  claimExpiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Artist on Event relationship model
export interface ArtistOnEvent {
  _id?: string;
  eventId: string; // Reference to Event
  artistId: string; // Reference to Artist
  role: 'instructor' | 'performer' | 'guest';
  fee?: number; // Fee paid to artist
  createdAt: Date;
  updatedAt: Date;
}

// Event category model
export interface EventCategory {
  _id?: string;
  name: string; // e.g. "Bachata", "Salsa", "Kizomba"
  description?: string;
  slug: string; // URL-friendly identifier
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}