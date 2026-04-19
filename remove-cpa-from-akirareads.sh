#!/bin/bash

###############################################################################
# Script to Remove CPA System Files from Akirareads Repository
# Author: Kania
# Date: 2026-04-18
#
# This script will:
# 1. Remove CPA-related files from Akirareads repo
# 2. Commit and push the changes
#
# Usage:
#   bash remove-cpa-from-akirareads.sh
#
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f ".git/config" ]; then
    echo "❌ Please run this script from the Akirareads repository root"
    exit 1
fi

echo "🔍 Checking current repository..."
CURRENT_REPO=$(git remote get-url origin 2>/dev/null || echo "unknown")

if [[ "$CURRENT_REPO" != *"Akirareads"* ]]; then
    echo "⚠️  Warning: This doesn't look like the Akirareads repository!"
    echo "   Current repo: $CURRENT_REPO"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 0
    fi
fi

echo ""
echo "🗑️  Files to be removed from Akirareads:"
echo ""

# List files to remove
FILE_LIST=(
    "SECURITY-UPDATES.md"
    "docs/CPA_SYSTEM.md"
    "docs/CPA_API.md"
    "docs/CPA_SETUP.md"
)

# Display the list
for file in "${FILE_LIST[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        echo "  - $file ✅ (exists)"
    else
        echo "  - $file ⚠️  (not found)"
    fi
done

echo ""
read -p "Remove these files and commit? (y/N): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 0
fi

echo ""
echo "🗑️  Removing CPA files..."
echo ""

# Remove files
for file in "${FILE_LIST[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✅ Removed: $file"
    elif [ -d "$file" ]; then
        rm -rf "$file"
        echo "  ✅ Removed directory: $file"
    else
        echo "  ⚠️  File/directory not found: $file"
    fi
done

echo ""
echo "📝 Adding changes to git..."
git add -A

echo ""
echo "💾 Committing changes..."
git commit -m "chore: remove CPA system files

This removes all CPA (Cost Per Action) related files from Akirareads repository.
CPA system has been moved to separate repository: sirwhy/Clieproxy

Files removed:
- SECURITY-UPDATES.md
- docs/CPA_SYSTEM.md
- docs/CPA_API.md
- docs/CPA_SETUP.md
"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! CPA files removed from Akirareads repository."
echo ""
echo "📋 Summary:"
echo "  - Removed CPA-related files"
echo "  - Committed changes"
echo "  - Pushed to GitHub"
echo ""
echo "🔗 Your Akirareads repo is now clean!"
echo ""
