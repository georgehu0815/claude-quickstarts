# Agents with Automatic Token Detection 🔑

A minimal educational implementation of LLM agents using the Claude API with **automatic API key detection** from macOS keychain.

> **Note:** This is NOT an SDK, but a reference implementation of key concepts

## ✨ What's New

- ✅ **Automatic API key detection** - retrieves credentials from macOS keychain (where Agency/Claude Code store them)
- ✅ **No manual setup** - works out-of-the-box if you use Agency or Claude Code CLI
- ✅ **Environment fallback** - still supports `ANTHROPIC_API_KEY` env var
- ✅ **Cross-platform** - gracefully handles non-macOS systems

## Overview & Core Components

This repo demonstrates how to [build effective agents](https://www.anthropic.com/engineering/building-effective-agents) with the Claude API. It shows how sophisticated AI behaviors can emerge from a simple foundation: LLMs using tools in a loop. This implementation is not prescriptive - the core logic is <300 lines of code and deliberately lacks production features. Feel free to translate these patterns to your language and production stack ([Claude Code](https://docs.claude.com/en/docs/agents-and-tools/claude-code/overview) can help!)

It contains four components:

- `agent.py`: Manages Claude API interactions, tool execution, and automatic token detection
- `token_manager.py`: Handles automatic API key retrieval from macOS keychain
- `tools/`: Tool implementations (both native and MCP tools)
- `utils/`: Utilities for message history and MCP server connections

## Usage

### Basic Agent (with automatic token detection)

```python
from agents.agent import Agent, ModelConfig

# No need to set ANTHROPIC_API_KEY!
# The agent will automatically retrieve it from keychain
agent = Agent(
    name="MyAgent",
    system="You are a helpful assistant.",
    config=ModelConfig(model="claude-sonnet-4-20250514"),
    verbose=True  # Shows when keychain is used
)

# Use the agent
response = agent.run("Hello, Claude!")
print(response.content[0].text)
```

### Agent with Tools and MCP Servers

```python
from agents.agent import Agent
from agents.tools.think import ThinkTool

# Create an agent with both local tools and MCP server tools
agent = Agent(
    name="MyAgent",
    system="You are a helpful assistant.",
    tools=[ThinkTool()],  # Local tools
    mcp_servers=[
        {
            "type": "stdio",
            "command": "python",
            "args": ["-m", "mcp_server"],
        },
    ]
)

# Run the agent
response = agent.run("What should I consider when buying a new laptop?")
```

From this foundation, you can add domain-specific tools, optimize performance, or implement custom response handling. We remain deliberately unopinionated - this backbone simply gets you started with fundamentals.

## 🔑 How Token Detection Works

The TokenManager automatically:

1. **Checks environment** - `ANTHROPIC_API_KEY` env var first
2. **Checks keychain** - Retrieves from "Claude Code" keychain service (macOS only)
3. **Falls back gracefully** - Returns None if no key found (with helpful error message)

The API key is stored in your macOS keychain when you use:
- `agency claude` command
- Claude Code CLI

See [token_manager.py](token_manager.py) for implementation details.

## Requirements

- Python 3.8+
- **Either:**
  - Agency or Claude Code CLI installed (for automatic token detection)
  - **OR** Claude API key set as `ANTHROPIC_API_KEY` environment variable
- Dependencies (install via requirements.txt):
  - `anthropic` Python library
  - `mcp` Python library

## 🚀 Quick Start

### 1. Set up virtual environment

```bash
cd agents
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run the test (no API key setup needed!)

```bash
python test_simple.py
```

If you use Agency or Claude Code CLI, the agent will automatically retrieve your API key from the keychain. Otherwise, set `ANTHROPIC_API_KEY` environment variable.