#!/bin/bash

# Parcego Courier Platform - HTTPS Development Server
# This script starts the development server with HTTPS support for camera access

echo "🚀 Starting Parcego Courier Platform with HTTPS support..."
echo "📱 Camera access will work over network LAN with HTTPS"
echo ""

# Check if SSL certificates exist
if [ ! -f "ssl/localhost.crt" ] || [ ! -f "ssl/localhost.key" ]; then
    echo "❌ SSL certificates not found. Generating them now..."
    echo ""
    
    # Create ssl directory if it doesn't exist
    mkdir -p ssl
    
    # Generate SSL certificates
    echo "🔐 Generating SSL certificates..."
    openssl req -x509 -out ssl/localhost.crt -keyout ssl/localhost.key -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -extensions EXT -config <(printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost,DNS:10.0.0.31,IP:127.0.0.1,IP:10.0.0.31\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificates generated successfully"
    else
        echo "❌ Failed to generate SSL certificates"
        exit 1
    fi
else
    echo "✅ SSL certificates found"
fi

echo ""
echo "🌐 Starting HTTPS server on https://10.0.0.31:3001"
echo "📷 Camera access will work on this HTTPS URL"
echo ""
echo "⚠️  Note: You may need to accept the self-signed certificate in your browser"
echo "   Click 'Advanced' → 'Proceed to 10.0.0.31 (unsafe)' in Chrome"
echo "   Or add security exception in Firefox"
echo ""
echo "🔍 Debugging: Check browser console for detailed error messages"
echo ""

# Start the HTTPS development server
echo "🔧 Starting HTTPS development server..."
echo "📊 If you see a white screen, check the browser console for errors"
echo ""

# Use the updated npm script with better error handling
npm run dev:https
