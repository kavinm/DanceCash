# Setup Checklist - Google Wallet + Public Assets

Complete this checklist to fully set up the Google Wallet integration and ensure all assets are properly configured.

## ✅ Public Assets Migration

- [x] Created `/public` directory
- [x] Migrated `Dance.cash.png` to `/public`
- [x] Migrated `enCA_add_to_google_wallet_add-wallet-badge.png` to `/public`
- [x] Added `.gitkeep` for directory tracking
- [x] Created `/public/README.md` documentation
- [x] Verified all PNG files are valid
- [ ] (Optional) Delete original images from `src/app/`

## ✅ Google Wallet Integration

- [x] Created `/src/app/api/wallet/google/route.ts`
- [x] Created `/src/components/GoogleWalletButton.tsx`
- [x] Created `/src/lib/googleWallet.ts` utilities
- [x] Updated `/src/app/register/[id]/page.tsx` to include Google Wallet button
- [x] Created `GOOGLE_WALLET_SETUP.md` documentation
- [ ] Install dependencies: `npm install` or `yarn install`

## ⚠️ Dependencies to Install

Run this command to install required packages:

```bash
npm install
# or
yarn install
```

Required new dependencies:
- `google-auth-library@^9.6.3`
- `googleapis@^144.0.0`

## 🔐 Environment Variables (Required)

Create or update your `.env.local` file in `packages/dapp/`:

```env
# Google Service Account Credentials (required)
# Get this from Google Cloud Console > Service Account > Create Key > JSON
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Google Wallet Issuer ID (required)
GOOGLE_WALLET_ISSUER_ID="3388000000023040661"
```

### How to Get Google Service Account Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable "Wallet Objects API"
4. Go to **IAM & Admin > Service Accounts**
5. Create a new service account
6. Create a JSON key for the service account
7. Copy the entire JSON content and paste into `.env.local`

⚠️ **IMPORTANT**: The JSON must be on a single line in the environment variable.

## 📝 Code Integration Points

### Register Page (Confirmation Step)
Location: `src/app/register/[id]/page.tsx`

The Google Wallet button is now displayed in a 3-column grid with:
- Google Wallet (NEW)
- Selene Wallet
- CashStamp

### Google Wallet Button Component
Location: `src/components/GoogleWalletButton.tsx`

Usage:
```tsx
<GoogleWalletButton
  eventData={eventData}
  ticketData={ticketData}
  onSuccess={(result) => console.log('Pass created:', result)}
  onError={(error) => console.error('Error:', error)}
/>
```

### API Endpoint
Location: `src/app/api/wallet/google/route.ts`

- **POST** `/api/wallet/google` - Create a Google Wallet pass
- **GET** `/api/wallet/google` - Get configuration

## 🧪 Testing

### Local Testing

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000`

3. Create an event and register

4. On the confirmation page, click "Add to Google Wallet"

5. You should see the Google Wallet URL open (or get an error if not configured)

### Mock Testing (Without Google Wallet Setup)

The component gracefully handles missing credentials:
- Shows error message
- Suggests setting up Google Wallet
- Doesn't break the page

## 🚀 Deployment

### Vercel

1. Add environment variables in Vercel project settings:
   - `GOOGLE_SERVICE_ACCOUNT`
   - `GOOGLE_WALLET_ISSUER_ID`

2. Deploy normally:
   ```bash
   vercel deploy
   ```

3. Public assets are automatically served

### Netlify

1. Add environment variables in Netlify settings
2. Deploy:
   ```bash
   netlify deploy
   ```

### Custom Server

1. Ensure `.env.local` is converted to production environment
2. Copy `/public` directory to production
3. Configure static file serving for `/` path

## 📊 Verification

Check that everything is working:

```bash
# Verify public directory
ls -la packages/dapp/public/

# Verify files exist
file packages/dapp/public/*.png

# Verify Node modules installed
npm list googleapis google-auth-library
```

### URLs to Test

- `http://localhost:3000/Dance.cash.png` (should load image)
- `http://localhost:3000/enCA_add_to_google_wallet_add-wallet-badge.png` (should load image)

## 🐛 Troubleshooting

### Issue: "Cannot find module 'googleapis'"
**Solution**: Run `npm install` or `yarn install`

### Issue: "GOOGLE_SERVICE_ACCOUNT environment variable not set"
**Solution**: Add `GOOGLE_SERVICE_ACCOUNT` to `.env.local`

### Issue: Images not loading
**Solution**: 
- Restart dev server
- Check paths start with `/`
- Verify files are in `public/` directory

### Issue: Google Wallet URL doesn't work
**Solution**:
- Verify service account credentials are valid
- Check GOOGLE_WALLET_ISSUER_ID is correct
- Review browser console for detailed errors

## 📚 Documentation Files

1. **`/public/README.md`** - How to use public assets
2. **`GOOGLE_WALLET_SETUP.md`** - Complete Google Wallet setup guide
3. **`PUBLIC_ASSETS_MIGRATION.md`** - Asset migration details
4. **`SETUP_CHECKLIST.md`** - This file

## ✨ Next Steps

### Immediate (Required)
- [ ] Run `npm install` to install dependencies
- [ ] Set up environment variables in `.env.local`
- [ ] Test Google Wallet integration locally

### Short Term (Recommended)
- [ ] Test registration flow with Google Wallet
- [ ] Verify passes appear in Google Wallet
- [ ] Test on mobile devices
- [ ] (Optional) Delete original images from `src/app/`

### Long Term (Optional)
- [ ] Optimize images using next/image component
- [ ] Add image caching strategies
- [ ] Implement CDN for media assets
- [ ] Add analytics for Google Wallet conversions

## 🎯 Success Criteria

Your setup is complete when:

✓ `npm run dev` starts without errors
✓ Public assets load at `/Dance.cash.png` and `/enCA_add_to_google_wallet_add-wallet-badge.png`
✓ Event registration page shows the confirmation screen
✓ Google Wallet button is visible on confirmation page
✓ Clicking "Add to Google Wallet" opens Google Wallet URL (or shows helpful error)

## 📞 Support Resources

- [Google Wallet API Docs](https://developers.google.com/wallet/tickets/events)
- [Next.js Public Assets](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)

## 📋 Quick Reference

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Key Files

```
packages/dapp/
├── .env.local                              # Environment variables
├── public/                                 # Public assets
│   ├── Dance.cash.png
│   └── enCA_add_to_google_wallet_...png
├── src/
│   ├── app/
│   │   ├── api/wallet/google/route.ts     # Google Wallet API
│   │   └── register/[id]/page.tsx         # Register page with button
│   ├── components/
│   │   └── GoogleWalletButton.tsx         # Button component
│   └── lib/
│       └── googleWallet.ts                # Utilities
├── GOOGLE_WALLET_SETUP.md                 # Setup guide
└── SETUP_CHECKLIST.md                     # This file
```

---

**Last Updated**: November 23, 2025
**Status**: ✅ Ready for Setup

