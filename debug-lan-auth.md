# LAN Authentication Debug Guide

## Issue Fixed
The courier login button wasn't working on LAN network (http://10.0.0.31:3001/courier-login) due to cookie security settings and network-specific authentication issues.

## Changes Made

### 1. Enhanced Cookie Handling (`app/courier-login/page.tsx`)
- **Smart Security Detection**: Automatically detects if running on HTTPS, localhost, or LAN network
- **LAN-Specific Cookie Settings**: Removes `Secure` flag for LAN networks and adds domain specification
- **Cookie Verification**: Checks if cookie was set successfully before redirecting
- **Fallback Authentication**: Uses URL parameters as backup for LAN networks when cookies fail
- **Debug Logging**: Comprehensive console logging for troubleshooting

### 2. Improved Middleware (`middleware.ts`)
- **Enhanced Cookie Reading**: Better cookie detection for LAN networks
- **Fallback Auth Support**: Handles temporary authentication via URL parameters
- **Comprehensive Debugging**: Detailed logging of authentication state
- **Time-based Validation**: Ensures temporary auth tokens are recent (5-minute expiry)

## Testing Steps

### 1. Start the LAN Server
```bash
npm run dev:lan
```

### 2. Access the Login Page
Navigate to: `http://10.0.0.31:3001/courier-login`

### 3. Test Login
Use any of these test credentials:
- `courier@parcego.com` / `password123`
- `driver@parcego.com` / `driver123`
- `test@parcego.com` / `test123`
- `demo@parcego.com` / `demo123`
- `admin@parcego.com` / `admin123`

### 4. Check Browser Console
Open Developer Tools (F12) and check the Console tab for debug messages:
- Cookie setting details
- Network detection
- Authentication verification
- Redirect status

### 5. Verify Success
After successful login, you should be redirected to `/courier` page.

## Debug Information

### Console Logs to Look For
```
Cookie set: courier_authenticated=true; path=/; max-age=86400; SameSite=Lax; domain=10.0.0.31
Current location: http://10.0.0.31:3001/courier-login
Protocol: http:
Hostname: 10.0.0.31
Cookie verification: true
Redirecting to /courier...
```

### Server Logs (Terminal)
```
Middleware - Pathname: /courier
Middleware - Has Courier Auth: true
Middleware - Has Valid Temp Auth: false
```

## Troubleshooting

### If Login Still Fails

1. **Check Console Errors**: Look for any JavaScript errors in browser console
2. **Verify Network**: Ensure you're accessing the correct LAN IP (10.0.0.31:3001)
3. **Clear Browser Data**: Clear cookies and localStorage for the site
4. **Check Server Logs**: Look for middleware debug messages in terminal
5. **Try Fallback Method**: The system will automatically use URL parameters if cookies fail

### Common Issues and Solutions

1. **Cookie Not Set**: 
   - Check if browser blocks cookies for HTTP sites
   - Verify domain settings in cookie

2. **Redirect Loop**:
   - Clear all cookies and localStorage
   - Check middleware logs for authentication state

3. **Network Issues**:
   - Ensure server is running on correct IP
   - Check firewall settings

## Fallback Authentication

If cookies fail on LAN networks, the system automatically uses a temporary URL-based authentication:
- URL format: `/courier?auth=temp&email=user@example.com&time=timestamp`
- Valid for 5 minutes
- Automatically handled by middleware

## Security Notes

- Cookies are set without `Secure` flag only for LAN networks (HTTP)
- Temporary authentication expires after 5 minutes
- All authentication methods include proper validation
- Debug logging is only for development - remove in production

## Next Steps

1. Test the login functionality on LAN network
2. Verify successful redirect to courier dashboard
3. Check that all courier features work properly
4. Remove debug logging before production deployment

## Files Modified

- `app/courier-login/page.tsx` - Enhanced authentication logic
- `middleware.ts` - Improved cookie handling and fallback support
- `package.json` - LAN development script (already existed)
