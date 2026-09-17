#!/usr/bin/env bash
set -euo pipefail

# Makes sure the one permanent piece of playground setup is in place: the playground itself
# (playground/, vite.playground.config.ts) is gitignored so it never gets committed. Idempotent —
# safe to run every time, does nothing on a repo that's already set up. Doesn't touch
# package.json — the playground is run directly via `npx vite --config vite.playground.config.ts`
# (see SKILL.md Step 4), so there's no npm script to add.
#
# This write is deliberately unconfirmed: it's additive (append-only .gitignore lines) and
# idempotent (re-running never changes an already-correct file), so there's nothing here that
# risks or requires a second look before it happens.
#
# Usage: ensure-setup.sh [target-repo-root]   (defaults to the current directory)

TARGET_DIR="${1:-.}"
GITIGNORE="$TARGET_DIR/.gitignore"

touch "$GITIGNORE"

add_if_missing() {
  local pattern="$1"
  if ! grep -qxF "$pattern" "$GITIGNORE"; then
    printf '%s\n' "$pattern" >> "$GITIGNORE"
    echo "Added \"$pattern\" to .gitignore"
  fi
}

# Anchored with a leading slash: an unanchored "playground/" would also match
# .claude/skills/playground-builder/assets/playground/, which must stay tracked.
add_if_missing "/playground/"
add_if_missing "/vite.playground.config.ts"

echo "Setup OK."
