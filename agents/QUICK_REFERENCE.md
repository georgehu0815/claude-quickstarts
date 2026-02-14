# Quick Reference - Claude Token Manager

## One-Line Usage

```python
from agents.agent import Agent

# That's it! Agent auto-detects credentials from env or keychain
agent = Agent(name="Bot", system="You are helpful.")
```

## Common Scenarios

### Scenario 1: First Time Setup

```bash
# Get your API key from https://console.anthropic.com/
export ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"

# Test it works
python3 -c "from agents.agent import Agent; print('✓ Ready!')"
```

### Scenario 2: Check Keychain Status

```bash
# Test keychain access
python3 agents/token_manager.py

# Or in Python
python3 -c "from agents.token_manager import get_api_key_from_keychain; print(get_api_key_from_keychain(verbose=True) or 'Not found')"
```

### Scenario 3: Use Agent Without Setting Env

```python
from anthropic import Anthropic
from agents.agent import Agent

# Pass client directly
client = Anthropic(api_key="sk-ant-api03-your-key")
agent = Agent(name="Bot", system="Helpful", client=client)
```

### Scenario 4: Debug Authentication

```python
from agents.agent import Agent

# Enable verbose mode to see auth source
agent = Agent(
    name="DebugAgent",
    system="You are helpful.",
    verbose=True  # Shows: env, keychain, or empty
)
```

## File Guide

| File | Purpose | When to Use |
|------|---------|-------------|
| `token_manager.py` | Core keychain access | Import in your code |
| `agent.py` | Agent with auto-auth | Your main agent class |
| `test_token_capture.py` | Test suite | Verify setup |
| `TOKEN_CAPTURE_README.md` | Full docs | Detailed reference |
| `setup_guide.md` | Setup instructions | First time setup |
| `QUICK_REFERENCE.md` | This file | Quick lookup |

## API Quick Reference

### TokenManager Class

```python
from agents.token_manager import TokenManager

manager = TokenManager(verbose=True)

# Get all credentials
creds = manager.get_claude_credentials()
# creds.api_key, creds.mcp_oauth_tokens, creds.session_token

# Get just API key
api_key = manager.get_anthropic_api_key()

# Setup environment vars
env_vars = manager.setup_environment()
```

### Convenience Functions

```python
from agents.token_manager import (
    get_api_key_from_keychain,
    get_claude_credentials
)

# Quick API key retrieval
api_key = get_api_key_from_keychain(verbose=True)

# Quick credential retrieval
credentials = get_claude_credentials(account="username", verbose=True)
```

### Agent Class

```python
from agents.agent import Agent, ModelConfig

agent = Agent(
    name="AgentName",              # Required: agent identifier
    system="System prompt",        # Required: agent instructions
    tools=[],                      # Optional: list of tools
    mcp_servers=[],                # Optional: MCP server configs
    config=ModelConfig(...),       # Optional: model settings
    verbose=False,                 # Optional: debug logging
    client=None,                   # Optional: Anthropic client
    message_params={}              # Optional: extra params
)

# Run synchronously
response = agent.run("Your message")

# Run asynchronously
response = await agent.run_async("Your message")
```

## Environment Variables

| Variable | Purpose | Priority |
|----------|---------|----------|
| `ANTHROPIC_API_KEY` | Anthropic API key | 1 (highest) |
| Keychain credentials | Fallback auth | 2 |
| Direct client | Override all | 0 (if provided) |

## Troubleshooting One-Liners

```bash
# Check if API key is set
echo ${ANTHROPIC_API_KEY:-"Not set"}

# Check keychain access
security find-generic-password -s "Claude Code-credentials" -g 2>&1 | grep "account"

# Test Anthropic client directly
python3 -c "from anthropic import Anthropic; c=Anthropic(); print('✓ Client works')"

# Test agent initialization
python3 -c "from agents.agent import Agent; Agent('Test', 'Hi', verbose=True); print('✓ Agent works')"

# Full test
python3 agents/test_token_capture.py
```

## Common Imports

```python
# Agent
from agents.agent import Agent, ModelConfig

# Token manager
from agents.token_manager import (
    TokenManager,
    ClaudeCredentials,
    get_api_key_from_keychain,
    get_claude_credentials
)

# Anthropic
from anthropic import Anthropic
```

## Code Snippets

### Minimal Agent

```python
from agents.agent import Agent

agent = Agent("Bot", "You are a helpful assistant.")
response = agent.run("Hello!")
print(response.content[0].text)
```

### Agent with Custom Config

```python
from agents.agent import Agent, ModelConfig

config = ModelConfig(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    temperature=1.0
)

agent = Agent("Bot", "Helpful assistant", config=config)
```

### Agent with Tools

```python
from agents.agent import Agent
from agents.tools.base import Tool

class MyTool(Tool):
    name = "my_tool"
    description = "Does something useful"
    input_schema = {...}

    def execute(self, **params):
        return "Result"

agent = Agent("Bot", "Uses tools", tools=[MyTool()])
```

## Keychain Commands

```bash
# List Claude-related keychain entries
security dump-keychain 2>&1 | grep -i claude

# Get Claude Code credentials
security find-generic-password -s "Claude Code-credentials" -w

# Add custom API key to keychain
security add-generic-password -a "$(whoami)" -s "my-api-key" -w "sk-ant-..."

# Delete keychain entry
security delete-generic-password -s "service-name"
```

## Testing Checklist

- [ ] Token manager retrieves keychain data: `python3 agents/token_manager.py`
- [ ] Environment variable is set: `echo $ANTHROPIC_API_KEY`
- [ ] Agent initializes: `python3 -c "from agents.agent import Agent; Agent('T','Hi')"`
- [ ] API call works: `python3 agents/test_token_capture.py`
- [ ] Verbose mode shows auth source: `Agent(..., verbose=True)`

## Support & Resources

- **Full Documentation**: [TOKEN_CAPTURE_README.md](TOKEN_CAPTURE_README.md)
- **Setup Guide**: [setup_guide.md](setup_guide.md)
- **Anthropic Console**: https://console.anthropic.com/
- **Anthropic Docs**: https://docs.anthropic.com/
- **Agency**: https://aka.ms/agency

---

**Last Updated**: 2026-02-13
**Status**: ✅ Working - Keychain integration active
