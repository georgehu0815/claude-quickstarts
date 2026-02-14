#!/usr/bin/env python3
"""Test script to verify token detection is working in browser-use-demo."""

import os
import sys
from pathlib import Path

# Add the browser_use_demo directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from browser_use_demo.token_manager import get_api_key_from_keychain

print("=" * 70)
print("Testing Browser Use Demo - Token Detection")
print("=" * 70)
print()

# Check environment
env_key = os.environ.get("ANTHROPIC_API_KEY")
if env_key:
    print(f"✓ ANTHROPIC_API_KEY found in environment: {env_key[:8]}...{env_key[-4:]}")
else:
    print("✗ No ANTHROPIC_API_KEY in environment")

print()

# Check storage file
config_dir = Path("~/.anthropic").expanduser()
api_key_file = config_dir / "api_key"

if api_key_file.exists():
    stored_key = api_key_file.read_text().strip()
    if stored_key:
        print(f"✓ API key found in storage file: {stored_key[:8]}...{stored_key[-4:]}")
    else:
        print("✗ Storage file exists but is empty")
else:
    print(f"✗ No API key file at {api_key_file}")

print()

# Check keychain
print("Testing keychain detection...")
try:
    keychain_key = get_api_key_from_keychain(verbose=True)
    if keychain_key:
        print(f"✓ API key found in keychain: {keychain_key[:8]}...{keychain_key[-4:]}")
    else:
        print("✗ No API key found in keychain")
except Exception as e:
    print(f"✗ Error accessing keychain: {e}")

print()
print("=" * 70)
print("Summary")
print("=" * 70)

# Determine which source will be used
if env_key:
    print("✅ Browser Use Demo will use API key from environment")
elif api_key_file.exists() and api_key_file.read_text().strip():
    print("✅ Browser Use Demo will use API key from storage file")
elif keychain_key:
    print("✅ Browser Use Demo will use API key from keychain")
else:
    print("❌ No API key found - you'll need to enter one manually")

print()
print("To run the demo:")
print("  docker-compose up --build")
print("  or")
print("  streamlit run browser_use_demo/streamlit.py")
print()
