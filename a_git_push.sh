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

CHANGES=$(git status --short | awk '{print $2}' | tr '\n' ' ')

if [ -z "$CHANGES" ]; then
  echo "ℹ️ Nothing to commit, working tree clean"
else
  git add .
  git commit -m "[$BRANCH] Auto commit on $CURRENT_TIME | Files: $CHANGES"
fi

git push origin "$BRANCH"

echo "✅ Code pushed to '$BRANCH' at $CURRENT_TIME"