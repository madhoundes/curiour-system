# HTTPS White Screen Troubleshooting Guide

## Problem Description
The courier page shows a white screen when accessing via HTTPS on your iPhone at `https://10.0.0.31:3001/courier`.

## Root Causes Identified
1. **Missing SSL certificates** - The HTTPS development server requires SSL certificates
2. **Next.js HTTPS configuration issues** - Experimental HTTPS flags may not work properly
3. **Authentication context problems** - The courier page may fail to load due to authentication checks

## Solutions Implemented

### 1. SSL Certificate Generation ✅
- Generated self-signed SSL certificates in `ssl/` directory
- Certificates include both localhost and network IP (10.0.0.31) in Subject Alternative Name
- Certificates are valid for development only

### 2. Next.js Configuration Updates ✅
- Updated `next.config.ts` to include proper HTTPS configuration
- Added SSL certificate loading for development mode
- Added network IP to allowed origins

### 3. Enhanced Error Handling ✅
- Added comprehensive debugging logs to courier page
- Added fallback error states for authentication issues
- Created HTTPS test page for debugging

### 4. Alternative HTTPS Scripts ✅
- `start-https-dev.sh` - Uses experimental HTTPS flags
- `start-https-dev-alt.sh` - Uses Next.js built-in HTTPS support

## How to Test

### Step 1: Start HTTPS Development Server
```bash
# Option 1: Use the main script
./start-https-dev.sh

# Option 2: Use alternative script
./start-https-dev-alt.sh

# Option 3: Manual command
npm run dev:https
```

### Step 2: Test HTTPS Functionality
1. Open `https://10.0.0.31:3001/https-test` in your browser
2. Check all test results show green/working status
3. Verify protocol shows "https:" and secure context is "true"

### Step 3: Test Courier Page
1. Navigate to `https://10.0.0.31:3001/courier`
2. Open browser developer tools (F12)
3. Check console for debugging messages
4. Look for any red error messages

## Debugging Steps

### If you still see a white screen:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

2. **Verify HTTPS Context**
   - Visit `https://10.0.0.31:3001/https-test`
   - Ensure all tests pass
   - Protocol should show "https:"

3. **Check Authentication**
   - The courier page requires authentication
   - If not logged in, you'll see an "Authentication Required" message
   - Login at `https://10.0.0.31:3001/courier-login` first

4. **Browser Certificate Issues**
   - Accept the self-signed certificate
   - In Chrome: Click "Advanced" → "Proceed to 10.0.0.31 (unsafe)"
   - In Firefox: Click "Advanced" → "Accept the Risk and Continue"

## Common Issues and Fixes

### Issue: "Failed to load resource: 404 (Not Found)"
**Fix:** This is usually a chunk loading issue. Try:
- Clear browser cache
- Restart the development server
- Check that all files are properly built

### Issue: "Camera access is only permitted in secure context"
**Fix:** Ensure you're using HTTPS, not HTTP

### Issue: White screen with no errors
**Fix:** Check the browser console for JavaScript errors that might be preventing rendering

### Issue: Authentication redirects
**Fix:** The courier page requires login. Use the courier login page first.

## Testing on iPhone

1. **Accept Certificate First**
   - Navigate to `https://10.0.0.31:3001`
   - Accept the security warning
   - Then try the courier page

2. **Check Network Connection**
   - Ensure your iPhone is on the same network
   - Verify the IP address is correct (10.0.0.31)

3. **Use Safari or Chrome**
   - Both browsers support the required features
   - Clear cache if needed

## Alternative Solutions

If the main HTTPS setup doesn't work:

1. **Use HTTP for testing** (without camera features):
   ```bash
   npm run dev:lan
   ```
   Then access `http://10.0.0.31:3001/courier`

2. **Use localhost HTTPS**:
   ```bash
   npm run dev:https:local
   ```
   Then access `https://localhost:3000/courier`

3. **Use mkcert for trusted certificates**:
   ```bash
   # Install mkcert
   brew install mkcert
   
   # Install local CA
   mkcert -install
   
   # Generate trusted certificates
   mkcert localhost 10.0.0.31 127.0.0.1
   ```

## Monitoring and Logs

The courier page now includes detailed logging:
- Check browser console for authentication status
- Look for HTTPS context information
- Monitor for any JavaScript errors

## Next Steps

1. Test the HTTPS setup using the provided scripts
2. Check the HTTPS test page for any issues
3. Verify the courier page loads properly
4. Test camera functionality if needed

If issues persist, check the browser console for specific error messages and share them for further debugging.
