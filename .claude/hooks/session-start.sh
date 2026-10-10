#!/bin/bash
set -euo pipefail

# Only run in Claude Code cloud sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install agent-browser CLI if missing (idempotent)
if ! command -v agent-browser >/dev/null 2>&1; then
  npm i -g agent-browser
fi

# Pre-install Playwright MCP server (used via .mcp.json) if missing (idempotent)
if ! command -v playwright-mcp >/dev/null 2>&1; then
  npm i -g @playwright/mcp
fi

# Install MarkItDown (CLI + MCP server used via .mcp.json) if missing (idempotent)
if ! command -v markitdown-mcp >/dev/null 2>&1; then
  pip install "markitdown[all]" markitdown-mcp
fi

# Install Agent Reach (read-only; no --system, no login channels) if missing (idempotent)
if ! command -v agent-reach >/dev/null 2>&1; then
  pip install "git+https://github.com/Panniantong/agent-reach.git@main"
fi

# Use the pre-installed Chromium instead of `agent-browser install`
CHROMIUM="/opt/pw-browsers/chromium"
if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -x "$CHROMIUM" ]; then
  echo "export AGENT_BROWSER_EXECUTABLE_PATH=\"$CHROMIUM\"" >> "$CLAUDE_ENV_FILE"
fi
