#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================================================="
echo " Starting PostgreSQL Database & pgAdmin Web UI"
echo "========================================================================="

docker compose up -d postgres pgadmin

echo ""
echo "========================================================================="
echo " PostgreSQL & pgAdmin are starting!"
echo " - PostgreSQL Host : localhost:5432"
echo " - PostgreSQL User : postgres"
echo " - PostgreSQL Pass : Hour1819"
echo ""
echo " - pgAdmin Web UI  : http://localhost:5050"
echo " - pgAdmin Login   : admin@admin.com / admin123"
echo "========================================================================="
