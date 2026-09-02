#!/bin/bash

# Navigate to git root directory
cd "$(git rev-parse --show-toplevel)" || exit 1

set -e

CURRENT_TIME=$(date "+%Y-%m-%d %H:%M:%S")
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "HEAD" ]; then
  echo "❌ Error: Repository is in detached HEAD state"
  exit 1
fi

CHANGE_COUNT=$(git status --short | wc -l | tr -d ' ')

if [ "$CHANGE_COUNT" -eq 0 ]; then
  echo "ℹ️ Nothing to commit, working tree clean"
else
  CHANGES_SUMMARY=$(git status --short | head -n 5 | awk '{print $2}' | tr '\n' ', ' | sed 's/,\s*$/.../')
  git add .
  git commit -m "[$BRANCH] Auto commit on $CURRENT_TIME | Changed ($CHANGE_COUNT files): $CHANGES_SUMMARY"
fi

git push origin "$BRANCH"

echo "✅ Code pushed to '$BRANCH' at $CURRENT_TIME"