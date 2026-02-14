#!/bin/bash
#
# Quick setup script for ANTHROPIC_API_KEY
#
# Usage: ./setup-api-key.sh

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║         Customer Support Agent - API Key Setup                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
  echo "⚠️  .env.local file already exists!"
  echo ""
  cat .env.local
  echo ""
  read -p "Do you want to update it? (y/N): " update
  if [ "$update" != "y" ]; then
    echo "Cancelled. No changes made."
    exit 0
  fi
fi

echo "Please enter your Anthropic API key:"
echo "(Get one from: https://console.anthropic.com/)"
echo ""
read -p "ANTHROPIC_API_KEY: " api_key

if [ -z "$api_key" ]; then
  echo "❌ Error: API key cannot be empty"
  exit 1
fi

# Validate API key format (basic check)
if [[ ! "$api_key" =~ ^sk-ant- ]]; then
  echo "⚠️  Warning: API key doesn't start with 'sk-ant-'"
  read -p "Continue anyway? (y/N): " continue
  if [ "$continue" != "y" ]; then
    echo "Cancelled."
    exit 1
  fi
fi

# Create or update .env.local
echo "ANTHROPIC_API_KEY=$api_key" > .env.local

# Check if AWS keys should be added
read -p "Do you also want to add AWS credentials for Bedrock? (y/N): " add_aws
if [ "$add_aws" = "y" ]; then
  read -p "BAWS_ACCESS_KEY_ID: " aws_key
  read -p "BAWS_SECRET_ACCESS_KEY: " aws_secret

  echo "BAWS_ACCESS_KEY_ID=$aws_key" >> .env.local
  echo "BAWS_SECRET_ACCESS_KEY=$aws_secret" >> .env.local
fi

echo ""
echo "✅ .env.local file created successfully!"
echo ""
echo "Contents:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat .env.local | sed 's/\(=.*\)/=***HIDDEN***/g'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next steps:"
echo "  1. Restart the server:"
echo "     kill \$(lsof -ti:3000)"
echo "     npm run dev"
echo ""
echo "  2. Open http://localhost:3000"
echo ""
echo "  3. Try sending a message!"
echo ""
