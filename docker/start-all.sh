#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================================================="
echo " Starting All Services (Postgres + Resource Storage Service)"
echo "========================================================================="

docker compose up -d

echo ""
echo "========================================================================="
echo " All Services Started!"
echo " - Postgres Database       : localhost:5432"
echo " - Resource Storage Service: http://localhost:7072"
echo "========================================================================="
