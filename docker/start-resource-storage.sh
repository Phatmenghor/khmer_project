#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================================================="
echo " Starting Resource Storage Service"
echo "========================================================================="

docker compose up -d resource-storage-service

echo ""
echo "========================================================================="
echo " Resource Storage Service is starting..."
echo " - Service Port : 7072"
echo " - Health Endpoint: http://localhost:7072/actuator/health"
echo "========================================================================="
