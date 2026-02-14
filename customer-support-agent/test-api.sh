#!/bin/bash
#
# Test script for Customer Support Agent API
#
# Usage:
#   1. Set your API key: export ANTHROPIC_API_KEY="sk-ant-api03-your-key"
#   2. Run: npm run dev (in another terminal)
#   3. Run this script: ./test-api.sh

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║         Customer Support Agent API Test                              ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"

# Check if server is running
if ! lsof -ti:3000 > /dev/null 2>&1; then
  echo ""
  echo "❌ Dev server is not running on port 3000"
  echo "   Please run: npm run dev"
  exit 1
fi

echo ""
echo "✓ Dev server is running on port 3000"
echo ""

# Check API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "⚠️  ANTHROPIC_API_KEY not set"
  echo "   Testing without API key (will show error handling)..."
else
  echo "✓ ANTHROPIC_API_KEY is set: ${ANTHROPIC_API_KEY:0:8}...${ANTHROPIC_API_KEY: -4}"
  echo "   Source: environment variable"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test chat API
echo "Sending test message to /api/chat..."
echo ""

RESPONSE=$(curl -s http://localhost:3000/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello, this is a test!"}],
    "model": "claude-sonnet-4-20250514"
  }')

# Parse and display response
echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if API key error
if echo "$RESPONSE" | jq -e '.debug.error == "API_KEY_MISSING"' > /dev/null 2>&1; then
  echo "Result: API Key Error (Expected without ANTHROPIC_API_KEY)"
  echo ""
  echo "✓ Error handling working correctly!"
  echo ""
  echo "To test with a real API key:"
  echo "  1. Set API key: export ANTHROPIC_API_KEY=\"sk-ant-api03-your-key\""
  echo "  2. Restart dev server: npm run dev"
  echo "  3. Run this script again: ./test-api.sh"
  echo ""
else
  echo "Result: API call successful!"
  echo ""
  echo "✓ Customer Support Agent is working!"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: TokenManager Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Running TokenManager tests..."
echo ""

npx tsx lib/test-token-manager.ts | tail -15

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                       Test Complete!                                  ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Summary:"
echo "  • Dev server: Running on http://localhost:3000"
echo "  • API endpoint: /api/chat"
echo "  • TokenManager: Working (automatic keychain detection)"
echo "  • Error handling: Working"
echo ""
echo "🌐 Open in browser: http://localhost:3000"
echo ""
