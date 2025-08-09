#!/bin/bash

echo "🚨 NextJS Development Server Recovery Script"
echo "============================================="

# Function to print colored output
print_status() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

# Step 1: Stop any running processes
print_status "Step 1: Stopping running Next.js processes..."
pkill -f "next" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2
print_success "Processes stopped"

# Step 2: Clean build artifacts
print_status "Step 2: Cleaning build artifacts..."
if [ -d ".next" ]; then
    rm -rf .next
    print_success "Removed .next directory"
else
    print_warning ".next directory not found"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    print_success "Removed node_modules/.cache"
else
    print_warning "node_modules/.cache not found"
fi

# Step 3: Clear any temporary Next.js files
print_status "Step 3: Cleaning temporary files..."
find . -name "*.tmp.*" -type f -delete 2>/dev/null || true
find . -name "_buildManifest.js*" -type f -delete 2>/dev/null || true
print_success "Temporary files cleaned"

# Step 4: Backup and reset config if needed
print_status "Step 4: Checking configuration..."
if [ -f "next.config.ts" ]; then
    cp next.config.ts next.config.ts.backup
    print_success "Backed up next.config.ts"
    
    # Create minimal config temporarily
    cat > next.config.ts.minimal << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal configuration for recovery
};

export default nextConfig;
EOF
    print_success "Created minimal config backup"
fi

# Step 5: Verify Node modules
print_status "Step 5: Verifying node_modules..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    print_warning "node_modules appears corrupted, reinstalling..."
    rm -rf node_modules package-lock.json
    npm install
    print_success "Reinstalled dependencies"
else
    print_success "node_modules appears healthy"
fi

# Step 6: Quick syntax check
print_status "Step 6: Running syntax check..."
if npm run lint --silent 2>/dev/null; then
    print_success "Lint check passed"
else
    print_warning "Lint issues found (non-blocking)"
fi

# Step 7: Try to start the server
print_status "Step 7: Starting development server..."
echo ""
echo "🚀 Attempting to start Next.js development server..."
echo "📝 Run the following command to start the server:"
echo ""
echo "   npm run dev:local"
echo ""
echo "📋 If it still fails, run the nuclear option:"
echo "   ./recovery-script.sh --nuclear"
echo ""
echo "🔧 Manual recovery commands:"
echo "   1. rm -rf .next node_modules"
echo "   2. npm install"
echo "   3. npm run dev:local"
echo ""
