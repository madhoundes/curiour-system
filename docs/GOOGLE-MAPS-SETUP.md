# Google Maps Integration Setup Guide

## Overview
The Parcego Courier System now includes Google Maps integration for the drop-off location page. This guide explains how to set up and use the Google Maps functionality.

## Features
- **Interactive Map Display**: Shows the exact location of drop-off points with markers
- **Automatic Geocoding**: Converts addresses to map coordinates automatically
- **Info Windows**: Displays location details when clicking on markers
- **Fallback Mode**: Works without API key using embedded Google Maps (limited features)

## Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"
5. Copy your new API key

### Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud project:
- **Maps JavaScript API**
- **Geocoding API**
- **Places API** (optional, for enhanced features)

To enable APIs:
1. Go to "APIs & Services" > "Library"
2. Search for each API
3. Click "Enable"

### Step 3: Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. In the Credentials page, click on your API key
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains (e.g., `localhost:3000/*`, `yourdomain.com/*`)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: Maps JavaScript API, Geocoding API, Places API
4. Click "Save"

### Step 4: Add API Key to Your Project

Create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important**: 
- Never commit `.env.local` to version control
- The `.env.local` file is already in `.gitignore`
- Use `NEXT_PUBLIC_` prefix to make the variable accessible in the browser

### Step 5: Restart Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## Usage

### Drop-off Location Page

The Google Maps component is automatically integrated into the drop-off location page at `/find-dropoff`.

**Features on this page**:
- Interactive map showing Parcego Business Hub location
- Map marker with business name
- Info window with address details
- Zoom and pan controls
- Full-screen option

### Using the GoogleMap Component

You can use the `GoogleMap` component in other pages:

```tsx
import { GoogleMap } from "@/components/ui/google-map";

function YourPage() {
  return (
    <GoogleMap
      address="3883 Quartz Road, Unit 3404"
      city="Toronto"
      province="ON"
      postalCode="M4B 2Z8"
      name="Parcego Business Hub"
      className="h-96 w-full"
      zoom={16}
    />
  );
}
```

**Props**:
- `address` (string): Street address
- `city` (string): City name
- `province` (string): Province/State code
- `postalCode` (string): Postal/ZIP code
- `name` (string): Location name for the marker
- `className` (string, optional): Additional CSS classes
- `zoom` (number, optional): Initial zoom level (default: 15)

## Fallback Mode (No API Key)

If no API key is configured, the component will automatically display a location card with a link to open Google Maps in a new browser tab. This fallback mode:

✅ **Works without an API key** - No configuration required
✅ **Shows location details** - Displays full address and business name
✅ **Opens in Google Maps** - Direct link to view location in Google Maps app/website
✅ **No iframe restrictions** - Avoids browser security issues with embedded maps
✅ **Mobile-friendly** - Works perfectly on all devices

❌ No interactive map embedded in the page
❌ Requires opening external Google Maps link
❌ No custom markers or zoom controls within the page

**How it works:**
- Shows a clean card with location icon and address
- "Open in Google Maps" button launches Google Maps in a new tab
- Helpful message prompting to add API key for full interactive features

## Troubleshooting

### Map Not Loading
1. Check if API key is correctly set in `.env.local`
2. Verify the API key has proper restrictions
3. Ensure Maps JavaScript API is enabled
4. Check browser console for errors

### "This page can't load Google Maps correctly"
- Your API key may be restricted or invalid
- Check API key restrictions match your domain
- Ensure billing is enabled in Google Cloud Console

### "Firefox Can't Open This Page" or iframe errors
- This occurs when trying to embed Google Maps without proper configuration
- The app now uses a fallback mode with a link to Google Maps instead of an iframe
- To get interactive embedded maps, add a valid Google Maps API key
- The fallback mode works perfectly on all browsers without API key

### Geocoding Errors
- Verify the address format is correct
- Check if Geocoding API is enabled
- Review API usage limits in Google Cloud Console

## API Usage and Billing

**Free Tier**:
- Google Maps offers $200 free credit per month
- This typically covers 28,000 map loads per month
- Monitor usage in Google Cloud Console

**Best Practices**:
- Implement caching for frequently accessed locations
- Use lazy loading for maps
- Consider restricting API key to specific domains
- Monitor API usage regularly

## Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API keys** to specific domains and APIs
4. **Monitor usage** to detect unauthorized access
5. **Rotate keys** periodically for enhanced security

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Maps API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding)

## Support

For issues or questions regarding Google Maps integration:
1. Check the troubleshooting section above
2. Review the Google Maps API documentation
3. Contact the development team

---

**Last Updated**: January 2025

