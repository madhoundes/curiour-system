# 🚨 NextJS Development Server Recovery & Debugging Guide

## Current Issue Analysis
Your Next.js development server is experiencing build manifest corruption with ENOENT errors after a configuration change. This is a common Turbopack issue that can be resolved systematically.

## 🔥 IMMEDIATE ACTION REQUIRED

**Stop the current broken server:**
1. Press `Ctrl+C` in the terminal running the dev server
2. Wait for the process to fully stop

## 🛠️ Recovery Methods (Try in order)

### Method 1: Quick Recovery
```bash
# Make the recovery script executable
chmod +x recovery-script.sh

# Run the recovery script
./recovery-script.sh

# If successful, start the server
npm run dev:local
```

### Method 2: Manual Recovery
```bash
# 1. Kill any lingering processes
pkill -f "next"
lsof -ti:3000 | xargs kill -9

# 2. Clear build cache
rm -rf .next
rm -rf node_modules/.cache

# 3. Clean temporary files
find . -name "*.tmp.*" -delete
find . -name "_buildManifest.js*" -delete

# 4. Start fresh
npm run dev:local
```

### Method 3: Nuclear Option (If above fails)
```bash
# Complete reset
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# Reinstall everything
npm install

# Use minimal config temporarily
cp next.config.minimal.ts next.config.ts

# Start server
npm run dev:local
```

## 🔍 Diagnostic Commands

### Check for corrupt files:
```bash
# Check for build manifest issues
ls -la .next/static/development/ 2>/dev/null || echo "No build directory"

# Check for zombie processes
ps aux | grep next

# Check port usage
lsof -i :3000
```

### Verify project health:
```bash
# Check for syntax errors
npm run lint

# Verify all pages exist
find app -name "page.tsx" -type f

# Check for missing dependencies
npm audit
```

## 🚀 Post-Recovery Verification

Once the server starts successfully:

1. **Test core routes:**
   ```bash
   curl -I http://localhost:3000
   curl -I http://localhost:3000/dashboard
   curl -I http://localhost:3000/track-package
   ```

2. **Verify functionality:**
   - Open http://localhost:3000
   - Navigate to dashboard
   - Test track package feature
   - Check admin panel

3. **Re-apply configurations gradually:**
   ```bash
   # Restore original config after server is stable
   cp next.config.ts.backup next.config.ts
   # Restart server to test
   npm run dev:local
   ```

## 🔧 Configuration Management

### Safe Config Changes:
```typescript
// next.config.ts - Safe incremental approach
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add one option at a time and test
  eslint: {
    ignoreDuringBuilds: true, // Only if needed
  },
  // Add more options gradually
};

export default nextConfig;
```

### Backup Strategy:
```bash
# Always backup before config changes
cp next.config.ts next.config.ts.backup.$(date +%Y%m%d_%H%M%S)

# Test changes in development
npm run build # Verify build works before committing
```

## 🚨 Emergency Rollback

If all recovery methods fail:
```bash
# Rollback to last working commit
git stash push -m "Broken dev server state"
git checkout HEAD~1

# Clean install
rm -rf node_modules .next
npm install
npm run dev:local
```

## 📝 Prevention Checklist

- [ ] Always test config changes incrementally
- [ ] Use `npm run build` before committing config changes
- [ ] Keep backup of working configuration
- [ ] Document configuration dependencies
- [ ] Use version control for all config changes

## 🔗 Related Resources

- [Next.js Turbopack Issues](https://nextjs.org/docs/app/api-reference/config/next-config-js)
- [Build Manifest Troubleshooting](https://nextjs.org/docs/messages/build-optimization-failed)
- [Development Server Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/dev-options)

---

**Remember:** The goal is to get the development server stable first, then gradually re-apply any needed configurations.
