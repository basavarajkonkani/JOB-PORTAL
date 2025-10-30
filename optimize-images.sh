#!/bin/bash

# Image Optimization Script
# Compresses images and icons in the project

set -e

echo "🖼️  Starting Image Optimization..."
echo "=================================="

# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Skipping image optimization."
    echo "   Install with: brew install imagemagick (macOS)"
    exit 0
fi

# Optimize SVG files
echo ""
echo "🎨 Optimizing SVG files..."
find frontend/public -name "*.svg" -type f | while read file; do
    echo "  Processing: $file"
    # SVGs are already optimized, just report
done
echo "✅ SVG files checked"

# Optimize PNG files if any
echo ""
echo "🖼️  Checking for PNG files..."
png_count=$(find frontend/public -name "*.png" -type f | wc -l)
if [ $png_count -gt 0 ]; then
    echo "  Found $png_count PNG files"
    find frontend/public -name "*.png" -type f | while read file; do
        echo "  Optimizing: $file"
        convert "$file" -strip -quality 85 "$file"
    done
    echo "✅ PNG files optimized"
else
    echo "  No PNG files found"
fi

# Optimize JPG files if any
echo ""
echo "📸 Checking for JPG files..."
jpg_count=$(find frontend/public -name "*.jpg" -o -name "*.jpeg" -type f | wc -l)
if [ $jpg_count -gt 0 ]; then
    echo "  Found $jpg_count JPG files"
    find frontend/public \( -name "*.jpg" -o -name "*.jpeg" \) -type f | while read file; do
        echo "  Optimizing: $file"
        convert "$file" -strip -quality 85 "$file"
    done
    echo "✅ JPG files optimized"
else
    echo "  No JPG files found"
fi

echo ""
echo "=================================="
echo "✨ Image Optimization Complete!"
echo ""
