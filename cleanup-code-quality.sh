#!/bin/bash

# Code Quality Cleanup Script
# Removes console.logs, debugger statements, and formats code

echo "🔍 Starting code quality cleanup..."

# Function to remove console.logs from files
remove_console_logs() {
    echo "🗑️  Removing console.log statements..."
    
    # Remove console.log from TypeScript/JavaScript files
    find frontend/components -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' '/console\.log/d' {} \;
    find frontend/app -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' '/console\.log/d' {} \;
    find frontend/lib -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' '/console\.log/d' {} \;
    
    find backend/src -type f \( -name "*.ts" -o -name "*.js" \) -exec sed -i '' '/console\.log/d' {} \;
}

# Function to remove debugger statements
remove_debuggers() {
    echo "🐛 Removing debugger statements..."
    
    find frontend -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' '/debugger;/d' {} \;
    find backend/src -type f \( -name "*.ts" -o -name "*.js" \) -exec sed -i '' '/debugger;/d' {} \;
}

# Function to remove commented code blocks
remove_commented_code() {
    echo "💬 Removing large commented code blocks..."
    
    # This is a simple approach - you may want to review manually
    # Removes lines starting with // or /* */
    # Be careful with this - review changes before committing
}

# Run cleanup functions
remove_console_logs
remove_debuggers

echo "✅ Code quality cleanup complete!"
echo ""
echo "⚠️  Important: Review the changes before committing!"
echo "Run: git diff to see what was changed"
