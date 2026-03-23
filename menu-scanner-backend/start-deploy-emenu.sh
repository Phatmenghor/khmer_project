#!/bin/bash
set -e

COMPOSE_FILE=docker-compose.build.yml
CONTAINER_NAME=emenu_backend

echo "Stopping old container..."
docker compose -f $COMPOSE_FILE down

echo "Building backend..."
docker compose -f $COMPOSE_FILE build backend

echo "Starting backend..."
docker compose -f $COMPOSE_FILE up -d backend

echo "Starting Monitor logs..."
docker logs -f menu-scanner-backend-backend

echo "✅ Backend is running on port 9090"
echo "Monitoring logs..."
docker logs -f $CONTAINER_NAME
