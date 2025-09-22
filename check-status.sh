#!/bin/bash

echo "🔍 NextJS Project Status Check"
echo "============================="

# Check if .next exists and its state
if [ -d ".next" ]; then
    echo "❌ .next directory exists (should be cleaned)"
    ls -la .next/static/development/ 2>/dev/null | head -5
else
    echo "✅ .next directory clean"
fi

# Check for running processes
NEXT_PROCESSES=$(ps aux | grep -v grep | grep next | wc -l)
if [ $NEXT_PROCESSES -gt 0 ]; then
    echo "❌ Next.js processes still running:"
    ps aux | grep -v grep | grep next
else
    echo "✅ No Next.js processes running"
fi

# Check port 3000
PORT_CHECK=$(lsof -ti:3000 2>/dev/null | wc -l)
if [ $PORT_CHECK -gt 0 ]; then
    echo "❌ Port 3000 is occupied:"
    lsof -i:3000
else
    echo "✅ Port 3000 is free"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules missing - run 'npm install'"
fi

# Check config files
if [ -f "next.config.ts" ]; then
    echo "✅ next.config.ts exists"
    echo "Current config:"
    cat next.config.ts
else
    echo "❌ next.config.ts missing"
fi

echo ""
echo "🚀 Ready to run recovery? Execute:"
echo "   chmod +x recovery-script.sh && ./recovery-script.sh"
