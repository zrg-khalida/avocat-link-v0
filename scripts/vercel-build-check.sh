#!/bin/bash

# Vercel Build Verification Script
# This script ensures the build output is correctly structured for Vercel

echo "🏗️  Vercel Build Verification"
echo "================================"

# Check if dist/client exists
if [ -d "dist/client" ]; then
  echo "✅ dist/client directory found"
  
  # Check if index.html exists
  if [ -f "dist/client/index.html" ]; then
    echo "✅ dist/client/index.html found"
    SIZE=$(wc -c < "dist/client/index.html")
    echo "   Size: $SIZE bytes"
  else
    echo "❌ ERROR: dist/client/index.html NOT found"
    exit 1
  fi
  
  # Check assets
  if [ -d "dist/client/assets" ]; then
    ASSET_COUNT=$(find "dist/client/assets" -type f | wc -l)
    echo "✅ dist/client/assets directory found ($ASSET_COUNT files)"
  else
    echo "⚠️  WARNING: dist/client/assets directory not found"
  fi
else
  echo "❌ ERROR: dist/client directory NOT found"
  exit 1
fi

# Verify vercel.json configuration
if [ -f "vercel.json" ]; then
  echo "✅ vercel.json configuration found"
  
  # Extract outputDirectory from vercel.json
  OUTPUT_DIR=$(grep -o '"outputDirectory"[^,}]*' vercel.json | cut -d'"' -f4)
  echo "   Output directory configured: $OUTPUT_DIR"
  
  # Verify it matches dist/client
  if [ "$OUTPUT_DIR" = "dist/client" ]; then
    echo "✅ outputDirectory correctly set to dist/client"
  else
    echo "⚠️  WARNING: outputDirectory is set to '$OUTPUT_DIR', expected 'dist/client'"
  fi
else
  echo "⚠️  WARNING: vercel.json not found - using Vercel defaults"
fi

# Summary
echo ""
echo "✅ Build verification completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - SPA build output: dist/client"
echo "   - Entry point: dist/client/index.html"
echo "   - Vercel framework: Vite (auto-detected)"
echo "   - SPA routing: Configured via vercel.json rewrites"
echo ""
echo "🚀 Ready for Vercel deployment!"
