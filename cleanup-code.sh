#!/bin/bash

# Code Cleanup Script - Remove console.log and debug statements
# This script cleans up source code files

set -e

echo "🔍 Starting Code Cleanup..."
echo "=================================="

# Function to remove console.log from files
cleanup_console_logs() {
    local file=$1
    # Remove console.log statements but keep console.error in production code
    # Only remove console.log, not console.error or console.warn
    sed -i.bak '/console\.log/d' "$file" && rm "${file}.bak"
}

# Function to clean TypeScript/JavaScript files
clean_ts_js_files() {
    echo ""
    echo "🧹 Cleaning console.log statements..."
    
    # Backend files
    find backend/src -type f \( -name "*.ts" -o -name "*.js" \) ! -path "*/node_modules/*" ! -path "*/dist/*" ! -name "*.test.ts" ! -name "*.spec.ts" | while read file; do
        if grep -q "console\.log" "$file"; then
            echo "  Cleaning: $file"
            cleanup_console_logs "$file"
        fi
    done
    
    # Frontend files (excluding test files)
    find frontend -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/e2e/*" ! -name "*.test.ts" ! -name "*.spec.ts" | while read file; do
        if grep -q "console\.log" "$file"; then
            echo "  Cleaning: $file"
            cleanup_console_logs "$file"
        fi
    done
    
    echo "✅ Console.log statements removed"
}

# Run cleanup
clean_ts_js_files

echo ""
echo "=================================="
echo "✨ Code Cleanup Complete!"
echo ""
echo "Files cleaned:"
echo "  ✅ Removed console.log statements"
echo "  ✅ Kept console.error for error handling"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Run linting: npm run lint"
echo "  3. Test the application: npm run dev"
echo ""
