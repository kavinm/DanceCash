# Public Assets Directory

This directory contains static assets that are publicly accessible in the Next.js application.

## Assets Included

### `Dance.cash.png`
- Size: ~1.4 MB
- Dimensions: 512x512px
- Format: PNG
- Purpose: Main branding image for the Dance Cash application
- Usage: Home page, marketing materials, social media

### `enCA_add_to_google_wallet_add-wallet-badge.png`
- Size: ~4.4 KB
- Format: PNG
- Purpose: Official Google Wallet "Add to Google Wallet" button image
- Usage: Event registration confirmation page
- Reference: [Google Wallet Developer Documentation](https://developers.google.com/wallet/tickets/events)

## How Next.js Serves These Assets

In Next.js, files in the `public` directory are served at the root URL:
- `/Dance.cash.png` → Accessed via `http://your-domain/Dance.cash.png`
- `/enCA_add_to_google_wallet_add-wallet-badge.png` → Accessed via `http://your-domain/enCA_add_to_google_wallet_add-wallet-badge.png`

## Using Assets in Components

### In React Components (TSX/JSX)
```tsx
import Image from 'next/image';

// Using Next.js Image component (recommended for optimization)
<Image
  src="/Dance.cash.png"
  alt="Dance Cash Logo"
  width={512}
  height={512}
/>

// Using standard img tag
<img src="/Dance.cash.png" alt="Dance Cash Logo" />
```

### In CSS/SCSS
```css
background-image: url('/Dance.cash.png');
```

### In Next.js API Routes
```typescript
// Reference the public URL
const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/Dance.cash.png`;
```

## Asset Optimization

### For Better Performance:
1. Consider using the Next.js `Image` component instead of `<img>` tags
2. The Image component automatically optimizes images for different screen sizes
3. Images are served via a CDN in production

### Using Next.js Image Component:
```tsx
<Image
  src="/Dance.cash.png"
  alt="Dance Cash"
  width={512}
  height={512}
  priority // Use for above-the-fold images
  placeholder="blur" // Add blur effect while loading
/>
```

## Adding New Assets

1. Place files in this `public/` directory
2. Reference them with leading slash in your application:
   ```
   /filename.ext
   ```
3. No need to rebuild the application when adding files

## Build Considerations

- Files in the `public` directory are automatically included in the build
- They're not processed by webpack and are served as-is
- Use for images, fonts, PDFs, and other static files
- Avoid putting large files here; consider using a CDN for media

## Environment Variables for Dynamic URLs

If you need to reference these assets with dynamic base URLs:

```typescript
// In .env.local
NEXT_PUBLIC_BASE_URL=https://example.com

// In your component
const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/Dance.cash.png`;
```

## Hosting on Vercel, Netlify, or Other Platforms

When deploying, the `public` directory contents are automatically:
- Copied to the build output
- Served with long-term caching headers
- Available at the application's root URL

## Performance Tips

1. **Image Optimization**: Use the `Image` component from `next/image`
2. **Lazy Loading**: Images below the fold automatically load when in view
3. **Format Optimization**: Consider converting to WebP or other formats for production
4. **CDN**: Consider using a CDN for frequently accessed assets

## Reference

- [Next.js Static Files Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)

