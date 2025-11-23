import { NextRequest } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Get Google service account credentials from environment
const getServiceAccountCredentials = () => {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT;
  
  if (!credentialsJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable not set');
  }

  try {
    return JSON.parse(credentialsJson);
  } catch (error) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT JSON');
  }
};

// Initialize Google Wallet API client
const getWalletClient = async () => {
  const credentials = getServiceAccountCredentials();

  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  });

  return google.walletobjects({ version: 'v1', auth });
};

/**
 * Generate a signed JWT for Google Wallet pass
 */
const generateSignedJwt = async (
  issuerId: string,
  classId: string,
  objectId: string
) => {
  const credentials = getServiceAccountCredentials();

  const payload = {
    iss: credentials.client_email,
    aud: 'google',
    origins: ['example.com'],
    typ: 'savetowallet',
    payload: {
      eventTicketObjects: [
        {
          id: objectId,
          classId: classId,
        },
      ],
    },
  };

  const jwtClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    keyId: credentials.private_key_id,
  });

  const token = await jwtClient.signBlob(Buffer.from(JSON.stringify(payload)));
  return token.toString('base64');
};

/**
 * Create a Google Wallet Event Ticket Class
 */
export const createEventTicketClass = async (
  issuerId: string,
  classSuffix: string,
  eventName: string,
  issuerName: string
) => {
  const client = await getWalletClient();

  const classId = `${issuerId}.${classSuffix}`;

  const newClass = {
    eventId: classId,
    eventName: {
      defaultValue: {
        language: 'en-US',
        value: eventName,
      },
    },
    id: classId,
    issuerName: issuerName,
    reviewStatus: 'UNDER_REVIEW',
    cardColor: {
      red: 0.4,
      green: 0.4,
      blue: 0.4,
    },
  };

  try {
    await client.eventticketclass.get({ resourceId: classId });
    console.log(`Class ${classId} already exists`);
    return classId;
  } catch (err: any) {
    if (err.status === 404) {
      const response = await client.eventticketclass.insert({
        requestBody: newClass,
      });
      console.log('Event Ticket Class created:', response.data);
      return classId;
    }
    throw err;
  }
};

/**
 * Create a Google Wallet Event Ticket Object
 */
export const createEventTicketObject = async (
  issuerId: string,
  classSuffix: string,
  objectSuffix: string,
  eventData: any,
  ticketData: any,
  imageCid?: string
) => {
  const client = await getWalletClient();

  const classId = `${issuerId}.${classSuffix}`;
  const objectId = `${issuerId}.${objectSuffix}`;

  const heroImageUri = imageCid 
    ? `https://ipfs.io/ipfs/${imageCid}`
    : 'https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg';

  const newObject = {
    id: objectId,
    classId: classId,
    state: 'ACTIVE',
    heroImage: {
      sourceUri: {
        uri: heroImageUri,
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: `${eventData.title} Ticket`,
        },
      },
    },
    textModulesData: [
      {
        header: 'Event Details',
        body: `${eventData.title} - ${new Date(eventData.date).toLocaleDateString()} at ${eventData.venue}`,
        id: 'event_details',
      },
      {
        header: 'Dancer',
        body: ticketData.dancerName,
        id: 'dancer_name',
      },
    ],
    barcode: {
      type: 'QR_CODE',
      value: ticketData.tokenId || 'QR_CODE_VALUE',
      alternateText: ticketData.tokenId?.substring(0, 12) || 'TICKET_ID',
    },
    locations: eventData.location?.latitude && eventData.location?.longitude ? [
      {
        latitude: eventData.location.latitude,
        longitude: eventData.location.longitude,
      },
    ] : [],
    ticketHolderName: ticketData.dancerName,
    ticketNumber: ticketData.tokenId?.substring(0, 16) || 'TICKET_001',
    seatInfo: {
      seat: {
        defaultValue: {
          language: 'en-US',
          value: 'General Admission',
        },
      },
    },
  };

  try {
    await client.eventticketobject.get({ resourceId: objectId });
    console.log(`Object ${objectId} already exists`);
    return objectId;
  } catch (err: any) {
    if (err.status === 404) {
      const response = await client.eventticketobject.insert({
        requestBody: newObject,
      });
      console.log('Event Ticket Object created:', response.data);
      return objectId;
    }
    throw err;
  }
};

/**
 * POST - Generate Google Wallet pass
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventData, ticketData, imageCid } = body;

    if (!eventData || !ticketData) {
      return Response.json(
        { error: 'Missing event or ticket data' },
        { status: 400 }
      );
    }

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023040661';
    const eventSuffix = eventData._id || 'event_' + Date.now();
    const objectSuffix = ticketData.tokenId?.substring(0, 16) || 'ticket_' + Date.now();

    // Create class
    const classId = await createEventTicketClass(
      issuerId,
      eventSuffix,
      eventData.title,
      'Dance Cash'
    );

    // Create object
    const objectId = await createEventTicketObject(
      issuerId,
      eventSuffix,
      objectSuffix,
      eventData,
      ticketData,
      imageCid
    );

    // Generate signed JWT
    const signedJwt = await generateSignedJwt(issuerId, classId, objectId);

    // Create the Google Wallet save URL
    const googleWalletUrl = `https://pay.google.com/gp/v/save/${signedJwt}`;

    return Response.json({
      success: true,
      classId,
      objectId,
      googleWalletUrl,
      signedJwt,
    });
  } catch (error) {
    console.error('Error creating Google Wallet pass:', error);
    return Response.json(
      { error: 'Failed to create Google Wallet pass', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET - Get Google Wallet configuration
 */
export async function GET(request: NextRequest) {
  try {
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023040661';

    return Response.json({
      issuerId,
      apiVersion: 'v1',
      googleWalletButtonImage: '/enCA_add_to_google_wallet_add-wallet-badge.png',
    });
  } catch (error) {
    console.error('Error getting Google Wallet config:', error);
    return Response.json(
      { error: 'Failed to get Google Wallet configuration' },
      { status: 500 }
    );
  }
}

