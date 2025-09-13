# HTTPS Setup for Camera Access

## Problem
Camera access in web browsers requires a secure context (HTTPS or localhost). When accessing the app over network LAN using HTTP (e.g., `http://10.0.0.31:3001`), camera functionality fails with the error:
```
Error: camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.
```

## Solution
This project now includes HTTPS support for development to enable camera access over network LAN.

## Quick Start

### Option 1: Use the HTTPS Script (Recommended)
```bash
./start-https-dev.sh
```

### Option 2: Manual HTTPS Development
```bash
npm run dev:https
```

### Option 3: Using Next.js Built-in HTTPS (Alternative)
```bash
# This will generate certificates automatically
next dev -H 10.0.0.31 -p 3001 --experimental-https
```

## Available Scripts

| Script | Description | URL |
|--------|-------------|-----|
| `npm run dev` | Standard development (localhost only) | `http://localhost:3000` |
| `npm run dev:local` | Local development | `http://localhost:3000` |
| `npm run dev:lan` | Network LAN (HTTP) | `http://10.0.0.31:3001` |
| `npm run dev:https` | **Network LAN (HTTPS)** | `https://10.0.0.31:3001` |
| `npm run dev:https:local` | Local HTTPS | `https://localhost:3000` |

## Browser Setup

### Chrome/Edge
1. Navigate to `https://10.0.0.31:3001`
2. Click "Advanced" → "Proceed to 10.0.0.31 (unsafe)"
3. Camera access will now work

### Firefox
1. Navigate to `https://10.0.0.31:3001`
2. Click "Advanced" → "Accept the Risk and Continue"
3. Camera access will now work

### Safari
1. Navigate to `https://10.0.0.31:3001`
2. Click "Show Details" → "visit this website"
3. Camera access will now work

## Technical Details

### SSL Certificates
- Self-signed certificates are generated in the `ssl/` directory
- Certificates include both localhost and network IP (10.0.0.31) in Subject Alternative Name
- Certificates are valid for development only

### Next.js Configuration
The `next.config.ts` includes HTTPS configuration:
```typescript
...(process.env.NODE_ENV === 'development' && {
  server: {
    https: {
      key: fs.readFileSync(path.join(process.cwd(), 'ssl/localhost.key')),
      cert: fs.readFileSync(path.join(process.cwd(), 'ssl/localhost.crt')),
    },
  },
}),
```

### Camera Error Handling
The app now includes enhanced error handling for camera access:
- Detects secure context requirements
- Provides clear error messages
- Shows HTTPS warning in UI when needed
- Graceful fallback to manual entry

## Troubleshooting

### Certificate Issues
If you get certificate errors:
1. Delete the `ssl/` directory
2. Run the certificate generation command again
3. Restart the development server

### Network Access Issues
If HTTPS doesn't work over network:
1. Check firewall settings
2. Ensure port 3001 is accessible
3. Try accessing via `https://localhost:3000` first

### Camera Still Not Working
1. Ensure you're using HTTPS URL
2. Check browser permissions for camera access
3. Try refreshing the page after accepting certificate
4. Check browser console for additional error details

## Security Note
These self-signed certificates are for development only. In production, use proper SSL certificates from a trusted Certificate Authority.
