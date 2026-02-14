#!/usr/bin/env python3
"""Minimal agent test - exactly as shown in documentation."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.agent import Agent, ModelConfig

print("Testing Claude Agent...\n")

# No need to set ANTHROPIC_API_KEY!
agent = Agent(
    name="MyAgent",
    system="You are a helpful assistant.",
    config=ModelConfig(model="claude-sonnet-4-20250514"),
    verbose=True  # Shows when keychain is used
)

print("\nAgent initialized! Sending test message...\n")

# Use the agent normally
response = agent.run("Hello, Claude!")

print("\n" + "="*70)
print("Response:")
print("="*70)
for block in response.content:
    if hasattr(block, 'text'):
        print(block.text)
print("="*70)

print("\n✓ Test completed successfully!")
