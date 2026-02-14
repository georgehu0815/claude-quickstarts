#!/usr/bin/env python3
"""Test script to demonstrate token capture from macOS keychain.

This script demonstrates how to use the token_manager to automatically
retrieve Claude API credentials without manually setting ANTHROPIC_API_KEY.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.agent import Agent, ModelConfig
from agents.token_manager import TokenManager, get_api_key_from_keychain


def test_token_manager():
    """Test the token manager functionality."""
    print("=" * 70)
    print("Claude Token Manager Test")
    print("=" * 70)

    # Test 1: Direct token manager usage
    print("\n📋 Test 1: Token Manager Direct Access")
    print("-" * 70)
    manager = TokenManager(verbose=True)

    print("\nRetrieving credentials from keychain...")
    credentials = manager.get_claude_credentials()

    print("\nCredentials Summary:")
    print(f"  • API Key Found: {bool(credentials.api_key)}")
    if credentials.api_key:
        masked = f"{credentials.api_key[:8]}...{credentials.api_key[-4:]}"
        print(f"    → Masked Key: {masked}")

    print(f"  • MCP OAuth Tokens: {len(credentials.mcp_oauth_tokens or {})}")
    if credentials.mcp_oauth_tokens:
        print(f"    → Services: {list(credentials.mcp_oauth_tokens.keys())}")

    print(f"  • Session Token: {bool(credentials.session_token)}")

    # Test 2: Environment setup
    print("\n📋 Test 2: Environment Variable Setup")
    print("-" * 70)
    env_vars = manager.setup_environment()
    if env_vars:
        print("Environment variables configured:")
        for key, value in env_vars.items():
            masked_val = f"{value[:8]}...{value[-4:]}" if len(value) > 12 else "***"
            print(f"  • {key}: {masked_val}")
    else:
        print("⚠️  No environment variables could be configured")
        print("   Fallback: Set ANTHROPIC_API_KEY manually")

    # Test 3: Agent initialization
    print("\n📋 Test 3: Agent with Auto Token Detection")
    print("-" * 70)

    # Remove any existing ANTHROPIC_API_KEY to test keychain fallback
    original_api_key = os.environ.get("ANTHROPIC_API_KEY")
    if original_api_key:
        print(f"Note: ANTHROPIC_API_KEY exists in environment")
        print(f"      Will use environment key: {original_api_key[:8]}...")
    else:
        print("Note: No ANTHROPIC_API_KEY in environment")
        print("      Will attempt to use keychain credentials")

    try:
        agent = Agent(
            name="TestAgent",
            system="You are a helpful AI assistant.",
            config=ModelConfig(model="claude-sonnet-4-20250514"),
            verbose=True
        )
        print("✓ Agent initialized successfully!")
        print(f"  • Agent Name: {agent.name}")
        print(f"  • Model: {agent.config.model}")
        print(f"  • Client configured: {bool(agent.client.api_key)}")

    except Exception as e:
        print(f"✗ Agent initialization failed: {e}")

    # Test 4: Convenience function
    print("\n📋 Test 4: Convenience Function")
    print("-" * 70)
    api_key = get_api_key_from_keychain(verbose=True)
    if api_key:
        print(f"✓ Retrieved API key: {api_key[:8]}...{api_key[-4:]}")
    else:
        print("✗ Could not retrieve API key from keychain")

    print("\n" + "=" * 70)
    print("Token Manager Test Complete!")
    print("=" * 70)


def test_agent_without_env_var():
    """Test that agent works without ANTHROPIC_API_KEY environment variable."""
    print("\n" + "=" * 70)
    print("Testing Agent Without Environment Variable")
    print("=" * 70)

    # Temporarily remove ANTHROPIC_API_KEY from environment
    original_key = os.environ.pop("ANTHROPIC_API_KEY", None)

    try:
        print("\n1. Creating agent without ANTHROPIC_API_KEY in environment...")
        agent = Agent(
            name="KeychainAgent",
            system="You are a helpful assistant.",
            verbose=True
        )

        if agent.client.api_key:
            print("✓ Agent successfully configured with keychain credentials!")
            print(f"  API Key: {agent.client.api_key[:8]}...{agent.client.api_key[-4:]}")

            # Optional: Test a simple API call
            print("\n2. Testing API call with keychain credentials...")
            try:
                response = agent.run("Say 'Hello from keychain!' in exactly 5 words.")
                print("✓ API call successful!")
                for block in response.content:
                    if hasattr(block, 'text'):
                        print(f"  Response: {block.text}")
            except Exception as e:
                print(f"✗ API call failed: {e}")
        else:
            print("✗ Agent could not retrieve credentials from keychain")
            print("  Please ensure you're logged in via 'agency claude' or 'claude'")

    except Exception as e:
        print(f"✗ Error: {e}")

    finally:
        # Restore original environment variable
        if original_key:
            os.environ["ANTHROPIC_API_KEY"] = original_key

    print("\n" + "=" * 70)


def main():
    """Run all tests."""
    print("\n🚀 Starting Claude Token Capture Tests\n")

    # Run token manager tests
    test_token_manager()

    # Ask user if they want to test API call
    print("\n" + "=" * 70)
    response = input("\nWould you like to test an actual API call? (y/N): ").strip().lower()
    if response == 'y':
        test_agent_without_env_var()
    else:
        print("Skipping API call test.")

    print("\n✨ All tests completed!\n")


if __name__ == "__main__":
    main()
