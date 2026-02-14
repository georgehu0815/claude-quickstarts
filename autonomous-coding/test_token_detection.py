#!/usr/bin/env python3
"""Test script to verify token detection is working."""

import os
from pathlib import Path
from client import create_client

print("=" * 70)
print("Testing Autonomous Coding Agent - Token Detection")
print("=" * 70)
print()

# Remove ANTHROPIC_API_KEY from environment to test keychain detection
if "ANTHROPIC_API_KEY" in os.environ:
    print("⚠️  ANTHROPIC_API_KEY is set in environment")
    print("   Unsetting it temporarily to test keychain detection...")
    saved_key = os.environ.pop("ANTHROPIC_API_KEY")
else:
    saved_key = None
    print("✓ No ANTHROPIC_API_KEY in environment")
    print("  Will test keychain detection...")

print()

try:
    # Try to create a client (this will test token detection)
    test_dir = Path("./test_project")
    print(f"Creating client with project dir: {test_dir}")
    print()

    client = create_client(test_dir, model="claude-sonnet-4-5-20250929")

    print()
    print("=" * 70)
    print("✅ SUCCESS! Token detection working!")
    print("=" * 70)
    print()
    print("The autonomous coding agent can now automatically retrieve")
    print("your API key from the macOS keychain (where Agency/Claude Code store it)")
    print()

except Exception as e:
    print()
    print("=" * 70)
    print("❌ ERROR")
    print("=" * 70)
    print(f"Error: {e}")
    print()

finally:
    # Restore the environment variable if it was set
    if saved_key:
        os.environ["ANTHROPIC_API_KEY"] = saved_key
        print("(Restored ANTHROPIC_API_KEY to environment)")

print()
print("Test complete!")
print()
