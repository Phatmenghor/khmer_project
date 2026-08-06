#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================================================="
echo " Stopping All Services"
echo "========================================================================="

docker compose down

echo ""
echo "All services stopped successfully."
