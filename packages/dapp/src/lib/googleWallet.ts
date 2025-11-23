/**
 * Google Wallet Integration Utilities
 * Handles creation and management of Google Wallet passes for event tickets
 */

export interface EventData {
  _id?: string;
  title: string;
  date: string;
  venue: string;
  price: number;
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
  };
  image?: string;
}

export interface TicketData {
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  dancerName: string;
  dancerEmail: string;
  dancerWallet: string;
  imageUrl: string;
  tokenId?: string;
  txId?: string;
  metadataCid?: string;
  metadataUri?: string;
  imageCid?: string;
}

/**
 * Generate a Google Wallet pass for an event ticket
 * @param eventData - Event information
 * @param ticketData - Ticket information
 * @returns Google Wallet URL and pass details
 */
export async function generateGoogleWalletPass(
  eventData: EventData,
  ticketData: TicketData
): Promise<{
  googleWalletUrl: string;
  classId: string;
  objectId: string;
  signedJwt: string;
} | null> {
  try {
    const response = await fetch('/api/wallet/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventData,
        ticketData,
        imageCid: ticketData.imageCid,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to generate Google Wallet pass:', error);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating Google Wallet pass:', error);
    return null;
  }
}

/**
 * Get Google Wallet configuration
 */
export async function getGoogleWalletConfig(): Promise<{
  issuerId: string;
  apiVersion: string;
  googleWalletButtonImage: string;
} | null> {
  try {
    const response = await fetch('/api/wallet/google', {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Failed to get Google Wallet config');
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Google Wallet config:', error);
    return null;
  }
}

/**
 * Open Google Wallet save URL
 * @param googleWalletUrl - The signed JWT URL from Google Wallet API
 */
export function openGoogleWalletPass(googleWalletUrl: string): void {
  if (!googleWalletUrl) {
    console.error('Invalid Google Wallet URL');
    return;
  }

  // Open in new window for better UX
  const newWindow = window.open(googleWalletUrl, '_blank', 'width=800,height=600');
  if (!newWindow) {
    // Fallback if popup was blocked
    window.location.href = googleWalletUrl;
  }
}

/**
 * Create a Google Wallet button element
 * @param onClick - Callback when button is clicked
 * @returns HTML element
 */
export function createGoogleWalletButton(onClick: () => void): HTMLElement {
  const button = document.createElement('a');
  button.href = '#';
  button.className = 'inline-block hover:opacity-80 transition-opacity';
  
  const img = document.createElement('img');
  img.src = '/enCA_add_to_google_wallet_add-wallet-badge.png';
  img.alt = 'Add to Google Wallet';
  img.style.width = '200px';
  img.style.height = 'auto';
  
  button.appendChild(img);
  button.addEventListener('click', (e) => {
    e.preventDefault();
    onClick();
  });
  
  return button;
}

/**
 * Validate ticket data before creating Google Wallet pass
 */
export function validateTicketData(ticketData: Partial<TicketData>): boolean {
  const requiredFields = [
    'eventId',
    'eventName',
    'dancerName',
    'dancerEmail',
    'dancerWallet',
  ];

  return requiredFields.every(field => {
    const value = (ticketData as any)[field];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
}

/**
 * Format event data for Google Wallet
 */
export function formatEventDataForWallet(eventData: any): EventData {
  return {
    _id: eventData._id?.toString?.() || eventData._id,
    title: eventData.title || 'Event',
    date: eventData.date?.toString?.() || new Date().toISOString(),
    venue: eventData.venue || 'TBD',
    price: parseFloat(eventData.price) || 0,
    location: {
      latitude: eventData.location?.latitude,
      longitude: eventData.location?.longitude,
      city: eventData.location?.city,
      state: eventData.location?.state,
    },
    image: eventData.image,
  };
}

