#!/bin/bash

# Parcego Courier Platform - Smart HTTPS Development Server
# This script automatically finds an available port and handles authentication

echo "🚀 Starting Parcego Courier Platform with Smart HTTPS support..."
echo "📱 Camera access will work over network LAN with HTTPS"
echo ""

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while ! check_port $port; do
        port=$((port + 1))
        if [ $port -gt $((start_port + 10)) ]; then
            echo "❌ Could not find available port starting from $start_port"
            exit 1
        fi
    done
    
    echo $port
}

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

# Find available port
echo "🔍 Checking for available port..."
PORT=$(find_available_port 3001)

if [ $PORT -ne 3001 ]; then
    echo "⚠️  Port 3001 is in use, using port $PORT instead"
    echo "🌐 Access your app at: https://10.0.0.31:$PORT"
else
    echo "✅ Port 3001 is available"
    echo "🌐 Access your app at: https://10.0.0.31:3001"
fi

echo ""
echo "📷 Camera access will work on this HTTPS URL"
echo "⚠️  Note: You may need to accept the self-signed certificate in your browser"
echo "   Click 'Advanced' → 'Proceed to 10.0.0.31 (unsafe)' in Chrome"
echo "   Or add security exception in Firefox"
echo ""
echo "🔍 Debugging: Check browser console for detailed error messages"
echo ""

# Start the HTTPS development server
echo "🔧 Starting HTTPS development server on port $PORT..."
echo "📊 If you see a white screen, check the browser console for errors"
echo ""

# Use the found port
next dev -H 10.0.0.31 -p $PORT --experimental-https --experimental-https-key ./ssl/localhost.key --experimental-https-cert ./ssl/localhost.crt
