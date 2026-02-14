"""Token manager for extracting Claude/Anthropic credentials from macOS keychain.

This module provides utilities to automatically retrieve API tokens and OAuth credentials
from the macOS keychain where Agency and Claude Code store their authentication data.
"""

import json
import subprocess
from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class ClaudeCredentials:
    """Container for Claude/Anthropic authentication credentials."""

    api_key: Optional[str] = None
    mcp_oauth_tokens: Optional[dict[str, Any]] = None
    session_token: Optional[str] = None


class TokenManager:
    """Manages extraction of tokens from macOS keychain and environment."""

    # Keychain service names where credentials are stored
    # IMPORTANT: "Claude Code" contains the actual API key!
    KEYCHAIN_SERVICES = {
        "claude_code": "Claude Code",  # Contains actual API key - check FIRST
        "claude_code_credentials": "Claude Code-credentials",  # MCP OAuth tokens
        "claude_safe_storage": "Claude Safe Storage",  # Encryption keys
    }

    def __init__(self, verbose: bool = False):
        """Initialize the token manager.

        Args:
            verbose: Enable detailed logging of token retrieval
        """
        self.verbose = verbose

    def _log(self, message: str) -> None:
        """Log a message if verbose mode is enabled."""
        if self.verbose:
            print(f"[TokenManager] {message}")

    def _get_keychain_password(
        self,
        service: str,
        account: Optional[str] = None
    ) -> Optional[str]:
        """Retrieve a password from the macOS keychain.

        Args:
            service: The keychain service name
            account: The account name (optional)

        Returns:
            The password/token if found, None otherwise
        """
        try:
            cmd = ["security", "find-generic-password", "-s", service, "-w"]
            if account:
                cmd.extend(["-a", account])

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )

            if result.returncode == 0:
                self._log(f"Successfully retrieved credential from service: {service}")
                return result.stdout.strip()
            else:
                self._log(f"No credential found for service: {service}")
                return None

        except Exception as e:
            self._log(f"Error accessing keychain for {service}: {e}")
            return None

    def _extract_api_key_from_mcp_credentials(
        self,
        credentials_json: str
    ) -> Optional[str]:
        """Extract API key from MCP credentials JSON.

        The Claude Code credentials in keychain contain OAuth tokens for MCP servers,
        but may also contain API keys or session tokens.

        Args:
            credentials_json: JSON string from keychain

        Returns:
            API key if found, None otherwise
        """
        try:
            data = json.loads(credentials_json)

            # Check for direct API key
            if "apiKey" in data:
                return data["apiKey"]

            # Check for anthropic API key in various locations
            if "anthropic" in data and isinstance(data["anthropic"], dict):
                if "apiKey" in data["anthropic"]:
                    return data["anthropic"]["apiKey"]

            # Check mcpOAuth tokens - may contain session info
            if "mcpOAuth" in data:
                self._log(f"Found MCP OAuth tokens for {len(data['mcpOAuth'])} services")

            return None

        except json.JSONDecodeError as e:
            self._log(f"Failed to parse credentials JSON: {e}")
            return None

    def get_claude_credentials(
        self,
        account: Optional[str] = None
    ) -> ClaudeCredentials:
        """Retrieve Claude credentials from macOS keychain.

        This method attempts to extract credentials from various keychain locations
        where Agency and Claude Code store their authentication data.

        Args:
            account: macOS username (optional, defaults to current user)

        Returns:
            ClaudeCredentials object containing available credentials
        """
        credentials = ClaudeCredentials()

        # FIRST: Try "Claude Code" service - this contains the actual API key!
        claude_code_api_key = self._get_keychain_password(
            self.KEYCHAIN_SERVICES["claude_code"],
            account
        )

        if claude_code_api_key and claude_code_api_key.startswith("sk-ant-"):
            self._log("Found Anthropic API key in Claude Code keychain service")
            credentials.api_key = claude_code_api_key
            return credentials  # Found the API key, we're done!

        # Fallback: Try "Claude Code-credentials" for MCP OAuth tokens
        claude_code_creds = self._get_keychain_password(
            self.KEYCHAIN_SERVICES["claude_code_credentials"],
            account
        )

        if claude_code_creds:
            try:
                creds_data = json.loads(claude_code_creds)
                credentials.mcp_oauth_tokens = creds_data.get("mcpOAuth", {})

                # Try to extract API key from credentials
                api_key = self._extract_api_key_from_mcp_credentials(claude_code_creds)
                if api_key:
                    credentials.api_key = api_key
                    return credentials

            except json.JSONDecodeError:
                self._log("Could not parse Claude Code credentials as JSON")

        # Try Claude Safe Storage as last resort
        safe_storage = self._get_keychain_password(
            self.KEYCHAIN_SERVICES["claude_safe_storage"]
        )
        if safe_storage and not credentials.api_key:
            # Safe storage might contain encrypted API key or session token
            credentials.session_token = safe_storage

        return credentials

    def get_anthropic_api_key(self) -> Optional[str]:
        """Get Anthropic API key from keychain or environment.

        Attempts multiple sources in order of preference:
        1. Environment variable ANTHROPIC_API_KEY
        2. Claude keychain credentials
        3. Agency configuration

        Returns:
            API key if found, None otherwise
        """
        import os

        # Check environment first
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if api_key:
            self._log("Using ANTHROPIC_API_KEY from environment")
            return api_key

        # Try to get from keychain
        credentials = self.get_claude_credentials()

        if credentials.api_key:
            self._log("Retrieved API key from keychain")
            return credentials.api_key

        self._log("No API key found in environment or keychain")
        return None

    def setup_environment(self, account: Optional[str] = None) -> dict[str, str]:
        """Set up environment variables from keychain credentials.

        This method retrieves credentials from the keychain and returns
        a dictionary of environment variables that can be used to configure
        the Anthropic client.

        Args:
            account: macOS username (optional)

        Returns:
            Dictionary of environment variables to set
        """
        env_vars = {}

        api_key = self.get_anthropic_api_key()
        if api_key:
            env_vars["ANTHROPIC_API_KEY"] = api_key
            self._log("ANTHROPIC_API_KEY configured from keychain")

        return env_vars


def get_api_key_from_keychain(verbose: bool = False) -> Optional[str]:
    """Convenience function to get API key from keychain.

    Args:
        verbose: Enable detailed logging

    Returns:
        API key if found, None otherwise
    """
    manager = TokenManager(verbose=verbose)
    return manager.get_anthropic_api_key()


def get_claude_credentials(
    account: Optional[str] = None,
    verbose: bool = False
) -> ClaudeCredentials:
    """Convenience function to get Claude credentials from keychain.

    Args:
        account: macOS username (optional)
        verbose: Enable detailed logging

    Returns:
        ClaudeCredentials object
    """
    manager = TokenManager(verbose=verbose)
    return manager.get_claude_credentials(account)


if __name__ == "__main__":
    # Test the token manager
    print("Testing Token Manager...")
    print("-" * 60)

    manager = TokenManager(verbose=True)

    print("\n1. Retrieving Claude credentials from keychain:")
    credentials = manager.get_claude_credentials()
    print(f"   - API Key found: {bool(credentials.api_key)}")
    print(f"   - MCP OAuth tokens: {len(credentials.mcp_oauth_tokens or {})}")
    print(f"   - Session token found: {bool(credentials.session_token)}")

    print("\n2. Getting Anthropic API key:")
    api_key = manager.get_anthropic_api_key()
    if api_key:
        # Mask the API key for security
        masked_key = f"{api_key[:8]}...{api_key[-4:]}" if len(api_key) > 12 else "***"
        print(f"   ✓ API Key: {masked_key}")
    else:
        print("   ✗ No API key found")

    print("\n3. Setting up environment:")
    env_vars = manager.setup_environment()
    for key, value in env_vars.items():
        masked_value = f"{value[:8]}...{value[-4:]}" if len(value) > 12 else "***"
        print(f"   - {key}: {masked_value}")

    print("\n" + "-" * 60)
    print("Token Manager test complete!")
