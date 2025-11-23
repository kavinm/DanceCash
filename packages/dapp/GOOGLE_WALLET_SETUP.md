# Google Wallet Integration Setup Guide

This guide explains how to set up Google Wallet integration for event tickets in the Dance Cash dapp.

## Overview

The Google Wallet integration allows users to add event tickets to their Google Wallet directly from the registration confirmation page. This provides a seamless experience for users to store and access their tickets.

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud project with the Wallet Objects API enabled
2. **Service Account**: Create a service account with permissions to manage wallet objects
3. **Issuer ID**: Obtain your Google Wallet Issuer ID from the Google Pay and Wallet Business Console

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the "Wallet Objects API"

### 2. Create a Service Account

1. In Google Cloud Console, go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Fill in the service account details
4. Click **Create and Continue**
5. Grant the following roles:
   - Service Account Admin
6. Click **Continue** and then **Done**

### 3. Create and Download Service Account Key

1. Click on the newly created service account
2. Go to **Keys > Add Key > Create new key**
3. Choose **JSON** format
4. Download the key file

### 4. Set Environment Variables

Add the following to your `.env.local` file (in `packages/dapp/`):

```env
# Google Wallet Configuration
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

GOOGLE_WALLET_ISSUER_ID="3388000000023040661"
```

**Important**: 
- Replace the JSON with your actual service account credentials
- The entire JSON must be on a single line as an environment variable
- For local development, use `.env.local`
- For production, set these in your deployment platform's environment variables (Vercel, Netlify, etc.)

### 5. Install Dependencies

```bash
npm install
# or
yarn install
```

## Usage

### In React Components

```tsx
import GoogleWalletButton from "@/components/GoogleWalletButton";

<GoogleWalletButton
  eventData={eventData}
  ticketData={ticketData}
  onSuccess={(result) => {
    console.log('Pass created:', result);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
/>
```

### API Endpoints

#### POST `/api/wallet/google`
Creates a Google Wallet pass for a ticket.

**Request Body:**
```json
{
  "eventData": {
    "_id": "event123",
    "title": "Dance Event",
    "date": "2024-01-15T18:00:00Z",
    "venue": "Main Hall",
    "price": 50,
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "city": "San Francisco",
      "state": "CA"
    },
    "image": "https://..."
  },
  "ticketData": {
    "eventId": "event123",
    "eventName": "Dance Event",
    "eventDate": "2024-01-15T18:00:00Z",
    "venue": "Main Hall",
    "dancerName": "John Doe",
    "dancerEmail": "john@example.com",
    "dancerWallet": "bitcoincash:...",
    "imageUrl": "https://...",
    "tokenId": "abc123def456",
    "txId": "txabc123",
    "imageCid": "QmXXXXX"
  }
}
```

**Response:**
```json
{
  "success": true,
  "classId": "3388000000023040661.event123",
  "objectId": "3388000000023040661.ticket_123",
  "googleWalletUrl": "https://pay.google.com/gp/v/save/eyJhbGci...",
  "signedJwt": "eyJhbGci..."
}
```

#### GET `/api/wallet/google`
Get Google Wallet configuration.

**Response:**
```json
{
  "issuerId": "3388000000023040661",
  "apiVersion": "v1",
  "googleWalletButtonImage": "/enCA_add_to_google_wallet_add-wallet-badge.png"
}
```

## Features

### GoogleWalletButton Component

A React component that handles:
- Creating Google Wallet passes
- Displaying the official "Add to Google Wallet" button
- Loading states and error handling
- Opening the Google Wallet save URL in a new window

### Utility Functions

Located in `src/lib/googleWallet.ts`:

- `generateGoogleWalletPass()` - Creates a pass and returns the save URL
- `openGoogleWalletPass()` - Opens the Google Wallet save URL
- `getGoogleWalletConfig()` - Retrieves configuration
- `validateTicketData()` - Validates required fields
- `formatEventDataForWallet()` - Formats event data for the API

## Event Ticket Details Included

When a pass is created, the following information is displayed:

- **Hero Image**: Event image from Pinata IPFS
- **Event Details**: Event name, date, and venue
- **Dancer Information**: Ticket holder's name
- **Barcode**: QR code containing the NFT token ID
- **Location**: If available
- **Ticket Number**: Token ID substring for easy reference

## Testing

### Test with Demo Mode

Google Wallet Demo Mode automatically adds "[TEST ONLY]" to passes for testing purposes. Once you get publishing access, this text will be removed.

### Testing Locally

1. Use the included image: `enCA_add_to_google_wallet_add-wallet-badge.png`
2. Test with your service account credentials
3. Verify the Google Wallet URL opens correctly

## Troubleshooting

### "GOOGLE_SERVICE_ACCOUNT environment variable not set"
- Ensure your `.env.local` file has the GOOGLE_SERVICE_ACCOUNT variable
- Make sure the JSON is properly formatted and on a single line

### "Invalid GOOGLE_SERVICE_ACCOUNT JSON"
- Check that the JSON is valid (use a JSON validator)
- Ensure special characters are properly escaped (especially the private key newlines should be `\n`)

### Pass Creation Fails
- Verify your service account has the correct permissions
- Check that the issuer ID is correct
- Review the API response for detailed error messages

### Google Wallet URL Doesn't Work
- Ensure the pass object was created successfully
- Verify the signed JWT is valid
- Check that the pass is in ACTIVE state

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit your service account credentials to version control
- Use `.env.local` for local development (added to `.gitignore`)
- For production, use secure environment variable management
- Rotate service account keys periodically

## Additional Resources

- [Google Wallet API Documentation](https://developers.google.com/wallet/tickets/events)
- [Google Wallet Business Console](https://pay.google.com/business/console)
- [Service Account Setup Guide](https://developers.google.com/identity/protocols/oauth2/service-account)

## Support

For issues with:
- **Google Wallet API**: Check [Google Wallet Documentation](https://developers.google.com/wallet)
- **Integration**: Review the component source code in `src/components/GoogleWalletButton.tsx`
- **Configuration**: Check `src/app/api/wallet/google/route.ts`

