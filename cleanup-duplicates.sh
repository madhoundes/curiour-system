#!/bin/bash

echo "🧹 Cleaning up duplicate directories..."

# Remove the duplicate directories
echo "Removing curiour-new/ directory..."
rm -rf "curiour-new/"

echo "Removing curiour-new copy/ directory..."
rm -rf "curiour-new copy/"

# Verify the directories are gone
echo "Verifying cleanup..."
if [ ! -d "curiour-new" ] && [ ! -d "curiour-new copy" ]; then
    echo "✅ Duplicate directories successfully removed!"
else
    echo "❌ Some directories still exist. Manual cleanup may be required."
    exit 1
fi

# Add changes to git
echo "Adding changes to git..."
git add -A

# Commit the cleanup
echo "Committing cleanup..."
git commit -m "chore: remove duplicate directories (curiour-new/ and curiour-new copy/)

- Remove outdated duplicate folders that were accidentally included
- Keep root-level files which contain the latest implementations
- This cleanup reduces repository size and eliminates confusion
- All functionality remains intact in root-level app/ directory"

echo "✅ Cleanup committed! Now push to GitHub:"
echo "git push origin Tracking-packges"
