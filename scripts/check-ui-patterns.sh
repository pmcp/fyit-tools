#!/bin/bash

# Nuxt UI v4 Pattern Checker
# This script checks for outdated v3 patterns in Vue files

echo "🔍 Checking for outdated Nuxt UI v3 patterns..."
echo "================================================"

FOUND_ISSUES=0

# Check for UModal with UCard
echo "Checking for UModal with UCard..."
if grep -r "UModal.*UCard" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt; then
    echo "❌ Found UModal with UCard (should use #content slot instead)"
    FOUND_ISSUES=1
fi

# Check for wrong modal slots
echo "Checking for wrong modal slots..."
if grep -r "UModal.*template #header\|UModal.*template #footer" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt; then
    echo "❌ Found UModal with #header or #footer (should use #content)"
    FOUND_ISSUES=1
fi

# Check for old component names
echo "Checking for renamed components..."

# UDropdown (should be UDropdownMenu)
if grep -r "<UDropdown[^M]" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt; then
    echo "❌ Found UDropdown (should be UDropdownMenu)"
    FOUND_ISSUES=1
fi

# UDivider (should be USeparator)
if grep -r "<UDivider" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt; then
    echo "❌ Found UDivider (should be USeparator)"
    FOUND_ISSUES=1
fi

# UToggle (should be USwitch)
if grep -r "<UToggle" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt; then
    echo "❌ Found UToggle (should be USwitch)"
    FOUND_ISSUES=1
fi

# UNotification (should be UToast)
if grep -r "<UNotification" --include="*.vue" . 2>/dev/null | grep -v node_modules | grep -v .nuxt; then
    echo "❌ Found UNotification (should be UToast)"
    FOUND_ISSUES=1
fi

echo "================================================"

if [ $FOUND_ISSUES -eq 0 ]; then
    echo "✅ No outdated v3 patterns found! Your code is using Nuxt UI v4 correctly."
else
    echo "⚠️  Found outdated patterns. Please update to Nuxt UI v4 syntax."
    echo "📚 See docs/guides/nuxt-ui-v4-cheatsheet.md for migration guide"
    exit 1
fi
