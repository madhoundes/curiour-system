#!/bin/bash

# React Native Cache Clearing Script
# This script clears all caches related to React Native development

echo "🧹 Starting React Native cache clearing process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Stop Metro bundler if running
print_status "Stopping Metro bundler..."
pkill -f "expo start" || true
pkill -f "react-native start" || true
pkill -f "metro" || true
print_success "Metro bundler stopped"

# 2. Clear Expo cache
print_status "Clearing Expo cache..."
expo r -c 2>/dev/null || print_warning "Expo cache clear failed (expo CLI might not be installed)"
print_success "Expo cache cleared"

# 3. Clear Metro bundler cache
print_status "Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/react-native-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true
print_success "Metro bundler cache cleared"

# 4. Clear React Native packager cache
print_status "Clearing React Native packager cache..."
rm -rf $TMPDIR/react-native-packager-cache-* 2>/dev/null || true
rm -rf $TMPDIR/metro-bundler-cache-* 2>/dev/null || true
print_success "React Native packager cache cleared"

# 5. Clear Watchman watches
print_status "Clearing Watchman watches..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null || print_warning "Watchman watch clearing failed"
    print_success "Watchman watches cleared"
else
    print_warning "Watchman not installed, skipping watch clearing"
fi

# 6. Clear npm cache
print_status "Clearing npm cache..."
npm cache clean --force 2>/dev/null || print_warning "npm cache clear failed"
print_success "npm cache cleared"

# 7. Clear node_modules and reinstall (optional)
read -p "Do you want to clear node_modules and reinstall dependencies? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing node_modules..."
    rm -rf node_modules
    print_success "node_modules removed"
    
    print_status "Reinstalling dependencies..."
    npm install
    print_success "Dependencies reinstalled"
else
    print_status "Skipping node_modules reinstall"
fi

# 8. Clear Android build cache (if android directory exists)
if [ -d "android" ]; then
    print_status "Clearing Android build cache..."
    cd android
    ./gradlew clean 2>/dev/null || print_warning "Android clean failed"
    ./gradlew cleanBuildCache 2>/dev/null || print_warning "Android build cache clean failed"
    cd ..
    print_success "Android build cache cleared"
fi

# 9. Clear iOS build cache (if ios directory exists)
if [ -d "ios" ]; then
    print_status "Clearing iOS build cache..."
    rm -rf ios/build 2>/dev/null || true
    print_success "iOS build cache cleared"
fi

# 10. Clear Expo cache directories
print_status "Clearing Expo cache directories..."
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf ~/.expo/tmp 2>/dev/null || true
print_success "Expo cache directories cleared"

# 11. Clear temporary files
print_status "Clearing temporary files..."
find . -name "*.log" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
print_success "Temporary files cleared"

echo
print_success "🎉 Cache clearing completed successfully!"
echo
print_status "You can now start your development server with:"
echo "  npm run start:clear    # Start with cleared cache"
echo "  npm run start:reset    # Start with reset cache"
echo "  npm start              # Normal start"
echo
print_status "Or use the in-app reload buttons:"
echo "  - Reload button: Restarts the app"
echo "  - Clear button: Clears cache and restarts the app"
