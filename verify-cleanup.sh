#!/bin/bash

# Verification Script - Check if cleanup was successful

echo "🔍 Verifying project cleanup..."
echo ""

# Count markdown files
MD_COUNT=$(find . -name "*.md" -type f | grep -v node_modules | grep -v .git | wc -l | tr -d ' ')
echo "📄 Markdown files remaining: $MD_COUNT (should be ~7)"

# Count shell scripts
SH_COUNT=$(find . -name "*.sh" -type f | grep -v node_modules | grep -v .git | wc -l | tr -d ' ')
echo "📜 Shell scripts remaining: $SH_COUNT"

# Check for .kiro directory
if [ -d ".kiro" ]; then
    echo "❌ .kiro directory still exists"
else
    echo "✅ .kiro directory removed"
fi

# Check for .vscode directory
if [ -d ".vscode" ]; then
    echo "❌ .vscode directory still exists"
else
    echo "✅ .vscode directory removed"
fi

# Check for docs directory
if [ -d "docs" ]; then
    echo "❌ docs directory still exists"
else
    echo "✅ docs directory removed"
fi

# Check backend scripts
BACKEND_SCRIPTS=$(find backend/src/scripts -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "🔙 Backend scripts remaining: $BACKEND_SCRIPTS (should be 1)"

# Check for debug components
if [ -d "frontend/components/debug" ]; then
    echo "❌ Debug components still exist"
else
    echo "✅ Debug components removed"
fi

echo ""
echo "📊 Project Structure:"
echo "-------------------"
ls -la | grep -E "^d" | awk '{print $9}' | grep -v "^\.$" | grep -v "^\.\.$" | grep -v "^\.git$" | grep -v "^node_modules$"

echo ""
echo "✅ Cleanup verification complete!"
echo ""
echo "Next steps:"
echo "1. Test the application: npm run dev"
echo "2. Run tests: npm test"
echo "3. Review changes: git status"
echo "4. Commit: git add . && git commit -m 'chore: production cleanup'"
