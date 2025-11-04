#!/bin/bash

# Sign-In Page Cross-Browser Testing Script
# This script helps run cross-browser tests for the sign-in page

set -e

echo "🧪 Sign-In Page Cross-Browser Testing"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests
run_test() {
    local test_name=$1
    local command=$2
    
    echo -e "${BLUE}Running: ${test_name}${NC}"
    echo "Command: $command"
    echo ""
    
    if eval "$command"; then
        echo -e "${GREEN}✅ ${test_name} passed${NC}"
    else
        echo -e "${YELLOW}⚠️  ${test_name} had failures${NC}"
    fi
    echo ""
}

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "Error: Must be run from frontend directory"
    exit 1
fi

# Parse command line arguments
TEST_TYPE=${1:-all}

case $TEST_TYPE in
    all)
        echo "Running all cross-browser tests..."
        run_test "All Browsers" "npx playwright test signin-cross-browser.spec.ts"
        ;;
    
    chrome)
        echo "Running Chrome tests..."
        run_test "Chrome" "npx playwright test signin-cross-browser.spec.ts --project=chromium"
        ;;
    
    firefox)
        echo "Running Firefox tests..."
        run_test "Firefox" "npx playwright test signin-cross-browser.spec.ts --project=firefox"
        ;;
    
    safari)
        echo "Running Safari/WebKit tests..."
        run_test "Safari" "npx playwright test signin-cross-browser.spec.ts --project=webkit"
        ;;
    
    mobile)
        echo "Running mobile device tests..."
        run_test "Mobile Touch Interactions" "npx playwright test signin-cross-browser.spec.ts -g 'Touch Interactions'"
        ;;
    
    desktop)
        echo "Running desktop layout tests..."
        run_test "Desktop Layout" "npx playwright test signin-cross-browser.spec.ts -g 'Desktop Layout'"
        ;;
    
    tablet)
        echo "Running tablet layout tests..."
        run_test "Tablet Layout" "npx playwright test signin-cross-browser.spec.ts -g 'Tablet Layout'"
        ;;
    
    breakpoints)
        echo "Running breakpoint tests..."
        run_test "375px Mobile" "npx playwright test signin-cross-browser.spec.ts -g 'Mobile Layout'"
        run_test "768px Tablet" "npx playwright test signin-cross-browser.spec.ts -g 'Tablet Layout'"
        run_test "1024px Desktop" "npx playwright test signin-cross-browser.spec.ts -g 'Desktop Layout'"
        run_test "1920px Wide" "npx playwright test signin-cross-browser.spec.ts -g 'Wide Screen'"
        ;;
    
    ui)
        echo "Running tests in UI mode..."
        npx playwright test signin-cross-browser.spec.ts --ui
        ;;
    
    report)
        echo "Generating test report..."
        npx playwright test signin-cross-browser.spec.ts --reporter=html
        npx playwright show-report
        ;;
    
    help)
        echo "Usage: ./test-signin-browsers.sh [option]"
        echo ""
        echo "Options:"
        echo "  all         - Run all cross-browser tests (default)"
        echo "  chrome      - Run Chrome/Chromium tests only"
        echo "  firefox     - Run Firefox tests only"
        echo "  safari      - Run Safari/WebKit tests only"
        echo "  mobile      - Run mobile device tests"
        echo "  desktop     - Run desktop layout tests"
        echo "  tablet      - Run tablet layout tests"
        echo "  breakpoints - Test all breakpoints (375px, 768px, 1024px, 1920px)"
        echo "  ui          - Run tests in interactive UI mode"
        echo "  report      - Generate and show HTML report"
        echo "  help        - Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./test-signin-browsers.sh chrome"
        echo "  ./test-signin-browsers.sh mobile"
        echo "  ./test-signin-browsers.sh breakpoints"
        ;;
    
    *)
        echo "Unknown option: $TEST_TYPE"
        echo "Run './test-signin-browsers.sh help' for usage information"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Testing complete!${NC}"
echo ""
echo "For more options, run: ./test-signin-browsers.sh help"
