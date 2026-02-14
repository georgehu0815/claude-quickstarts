#!/usr/bin/env python3
"""Simple test script to verify Claude Agent works with automatic token detection.

This script tests the agent with a simple query to ensure:
1. Token detection from environment/keychain works
2. Agent initialization succeeds
3. API calls work correctly
4. Response handling is correct
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.agent import Agent, ModelConfig


def test_agent_simple():
    """Test basic agent functionality with automatic token detection."""
    print("=" * 70)
    print("Claude Agent Test")
    print("=" * 70)

    # Check if API key is available
    print("\n📋 Step 1: Checking authentication...")
    api_key_env = os.environ.get("ANTHROPIC_API_KEY")
    if api_key_env:
        print(f"✓ ANTHROPIC_API_KEY found in environment: {api_key_env[:8]}...")
    else:
        print("⚠ No ANTHROPIC_API_KEY in environment")
        print("  Will try keychain fallback...")

    # Initialize agent
    print("\n📋 Step 2: Initializing agent...")
    try:
        agent = Agent(
            name="MyAgent",
            system="You are a helpful assistant.",
            config=ModelConfig(model="claude-sonnet-4-20250514"),
            verbose=True  # Shows when keychain is used
        )
        print("✓ Agent initialized successfully!")
        print(f"  • Agent name: {agent.name}")
        print(f"  • Model: {agent.config.model}")
        print(f"  • Max tokens: {agent.config.max_tokens}")
        print(f"  • Has API key: {bool(agent.client.api_key)}")

        if not agent.client.api_key:
            print("\n✗ ERROR: No API key available!")
            print("  Please set ANTHROPIC_API_KEY environment variable:")
            print("  export ANTHROPIC_API_KEY='sk-ant-api03-your-key'")
            return False

    except Exception as e:
        print(f"✗ Agent initialization failed: {e}")
        return False

    # Test API call
    print("\n📋 Step 3: Testing API call...")
    try:
        print("  Sending: 'Hello, Claude!'")
        response = agent.run("Hello, Claude!")

        print("✓ API call successful!")
        print(f"  • Response type: {type(response)}")
        print(f"  • Content blocks: {len(response.content)}")

        # Print the response
        print("\n📝 Response:")
        print("-" * 70)
        for block in response.content:
            if hasattr(block, 'text'):
                print(block.text)
            elif hasattr(block, 'type'):
                print(f"[{block.type}]: {block}")
        print("-" * 70)

        return True

    except Exception as e:
        print(f"✗ API call failed: {e}")
        print(f"  Error type: {type(e).__name__}")

        # Provide helpful error messages
        if "authentication" in str(e).lower() or "api_key" in str(e).lower():
            print("\n💡 Authentication error - Please check:")
            print("  1. ANTHROPIC_API_KEY is set correctly")
            print("  2. API key is valid (not expired)")
            print("  3. Key has format: sk-ant-api03-...")

        return False


def test_agent_with_tools():
    """Test agent with a more complex query."""
    print("\n" + "=" * 70)
    print("Advanced Agent Test")
    print("=" * 70)

    print("\n📋 Testing agent with a calculation query...")
    try:
        agent = Agent(
            name="CalculatorAgent",
            system="You are a helpful assistant that solves math problems.",
            config=ModelConfig(
                model="claude-sonnet-4-20250514",
                max_tokens=1024
            ),
            verbose=False
        )

        query = "What is 123 * 456? Please calculate and explain."
        print(f"  Query: '{query}'")

        response = agent.run(query)

        print("✓ Complex query successful!")
        print("\n📝 Response:")
        print("-" * 70)
        for block in response.content:
            if hasattr(block, 'text'):
                print(block.text)
        print("-" * 70)

        return True

    except Exception as e:
        print(f"✗ Complex query failed: {e}")
        return False


def test_agent_memory():
    """Test agent conversation memory."""
    print("\n" + "=" * 70)
    print("Memory Test - Multiple Turns")
    print("=" * 70)

    print("\n📋 Testing multi-turn conversation...")
    try:
        agent = Agent(
            name="MemoryAgent",
            system="You are a helpful assistant.",
            verbose=False
        )

        # First turn
        print("\n  Turn 1: 'My name is Alice.'")
        response1 = agent.run("My name is Alice. Remember this.")
        print(f"  Response: {response1.content[0].text[:50]}...")

        # Second turn - test memory
        print("\n  Turn 2: 'What is my name?'")
        response2 = agent.run("What is my name?")
        response_text = response2.content[0].text
        print(f"  Response: {response_text}")

        # Check if agent remembers
        if "Alice" in response_text or "alice" in response_text:
            print("✓ Agent remembers previous conversation!")
            return True
        else:
            print("⚠ Agent may not have remembered (expected 'Alice' in response)")
            return False

    except Exception as e:
        print(f"✗ Memory test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("\n🚀 Starting Claude Agent Tests\n")

    results = {
        "Simple Test": False,
        "Advanced Test": False,
        "Memory Test": False
    }

    # Run simple test
    results["Simple Test"] = test_agent_simple()

    # Only run other tests if simple test passed
    if results["Simple Test"]:
        response = input("\n⏸ Simple test passed! Run advanced tests? (Y/n): ").strip().lower()
        if response != 'n':
            results["Advanced Test"] = test_agent_with_tools()
            results["Memory Test"] = test_agent_memory()
    else:
        print("\n⚠ Skipping advanced tests due to simple test failure.")
        print("  Please fix authentication issues first.")

    # Print summary
    print("\n" + "=" * 70)
    print("Test Summary")
    print("=" * 70)
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED/SKIPPED"
        print(f"  {test_name}: {status}")

    all_run_passed = all(passed for test_name, passed in results.items() if passed is not False)

    if all_run_passed:
        print("\n🎉 All tests passed! Your agent is working correctly.")
    else:
        print("\n⚠ Some tests failed or were skipped.")
        print("  Check the output above for details.")

    print("=" * 70)


if __name__ == "__main__":
    main()
