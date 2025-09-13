# Cache Clearing & Reload Guide

This guide explains how to clear caches and reload the React Native app to ensure fresh data and proper functionality.

## 🚀 Quick Start

### In-App Reload Buttons
The deliveries screen now includes two convenient buttons in the header:

1. **🔄 Reload Button**: Restarts the app to refresh all data
2. **🗑️ Clear Button**: Clears all caches and restarts the app with fresh data

### Development Server Commands

```bash
# Start with cleared cache
npm run start:clear

# Start with reset cache
npm run start:reset

# Clear all caches and reinstall dependencies
npm run clean:all

# Run comprehensive cache clearing script
./clear-cache.sh
```

## 📱 In-App Reload Features

### Reload Button
- **Function**: Restarts the app using `react-native-restart`
- **Use Case**: When you want to refresh the app without clearing caches
- **Behavior**: 
  - Shows confirmation dialog
  - Restarts the app immediately
  - Preserves all app state

### Clear Cache Button
- **Function**: Clears app state and restarts the app
- **Use Case**: When you want to reset all data and clear caches
- **Behavior**:
  - Resets deliveries to fresh mock data (25 deliveries)
  - Resets filter to 'all'
  - Shows confirmation dialog
  - Restarts the app with fresh data

## 🛠️ Development Scripts

### NPM Scripts
```bash
# Basic start commands
npm start                    # Normal start
npm run start:clear         # Start with cleared cache
npm run start:reset         # Start with reset cache

# Platform-specific with cache clearing
npm run android:clear       # Android with cleared cache
npm run ios:clear          # iOS with cleared cache
npm run web:clear          # Web with cleared cache

# Cache clearing commands
npm run clean:cache         # Clear Expo cache
npm run clean:metro         # Clear Metro bundler cache
npm run clean:watchman      # Clear Watchman watches
npm run clean:temp          # Clear temporary files
npm run clean:all           # Clear everything and reinstall
```

### Comprehensive Cache Clearing Script
```bash
# Run the comprehensive cache clearing script
./clear-cache.sh
```

This script clears:
- Metro bundler cache
- React Native packager cache
- Watchman watches
- npm cache
- Expo cache directories
- Android build cache (if exists)
- iOS build cache (if exists)
- Temporary files
- Optionally: node_modules and dependencies

## 🔧 Manual Cache Clearing

### 1. Metro Bundler Cache
```bash
# Stop Metro bundler
pkill -f "expo start"
pkill -f "metro"

# Clear Metro cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-native-*
rm -rf $TMPDIR/haste-map-*
```

### 2. React Native Packager Cache
```bash
rm -rf $TMPDIR/react-native-packager-cache-*
rm -rf $TMPDIR/metro-bundler-cache-*
```

### 3. Watchman Watches
```bash
watchman watch-del-all
```

### 4. NPM Cache
```bash
npm cache clean --force
```

### 5. Expo Cache
```bash
expo r -c
rm -rf ~/.expo/cache
rm -rf ~/.expo/tmp
```

### 6. Android Build Cache
```bash
cd android
./gradlew clean
./gradlew cleanBuildCache
```

### 7. iOS Build Cache
```bash
rm -rf ios/build
```

## 🐛 Troubleshooting

### Issue: Badge counts not updating
**Solution**: Use the Clear Cache button or run `npm run start:clear`

### Issue: App not reflecting code changes
**Solution**: 
1. Use the Reload button in-app
2. Or run `./clear-cache.sh` and restart

### Issue: Metro bundler errors
**Solution**: 
1. Stop all Metro processes: `pkill -f metro`
2. Clear Metro cache: `rm -rf $TMPDIR/metro-*`
3. Restart: `npm run start:clear`

### Issue: Dependencies not updating
**Solution**: 
1. Run `npm run clean:all`
2. Or manually: `rm -rf node_modules && npm install`

## 📊 Expected Results

After clearing cache and reloading, you should see:

- **Header Badge**: "25 remaining" (accurate count)
- **Filter Counts**:
  - All: 25
  - Ready: 9
  - In Transit: 8
  - Assigned: 8
  - Delivered: 0
- **Delivery Cards**: 25 unique delivery cards with diverse data
- **Performance**: Smooth scrolling with FlatList optimization

## 🔍 Verification Steps

1. **Check Badge Count**: Should show "25 remaining"
2. **Check Filter Counts**: Should match actual displayed items
3. **Check Delivery Cards**: Should see 25 different customers
4. **Test Scrolling**: Should be smooth and responsive
5. **Test Actions**: Reload and Clear buttons should work

## 💡 Best Practices

1. **Use In-App Buttons**: For quick testing and development
2. **Use Scripts**: For comprehensive cache clearing
3. **Restart Regularly**: Clear cache when switching between features
4. **Monitor Performance**: Use FlatList optimization for large lists
5. **Test Thoroughly**: Verify counts and functionality after clearing

## 🚨 Important Notes

- **Data Loss**: Clearing cache will reset all app state
- **Reinstall Time**: `clean:all` will reinstall all dependencies
- **Platform Specific**: Some cache clearing is platform-specific
- **Development Only**: These commands are for development, not production

## 📝 Quick Reference

| Action | Command | Use Case |
|--------|---------|----------|
| Quick Reload | In-app Reload button | Refresh app state |
| Clear & Reload | In-app Clear button | Reset all data |
| Start with Clear | `npm run start:clear` | Fresh development start |
| Full Clean | `./clear-cache.sh` | Complete cache reset |
| Nuclear Option | `npm run clean:all` | Reset everything |

---

**Need Help?** Check the console logs for any error messages and ensure all dependencies are properly installed.
