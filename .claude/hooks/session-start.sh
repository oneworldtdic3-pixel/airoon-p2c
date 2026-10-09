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

# Use the pre-installed Chromium instead of `agent-browser install`
CHROMIUM="/opt/pw-browsers/chromium"
if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -x "$CHROMIUM" ]; then
  echo "export AGENT_BROWSER_EXECUTABLE_PATH=\"$CHROMIUM\"" >> "$CLAUDE_ENV_FILE"
fi
