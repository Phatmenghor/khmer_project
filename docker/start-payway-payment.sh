#!/bin/sh
echo "========================================================================="
echo " Starting PayWay Payment Gateway Microservice"
echo "========================================================================="

cd "$(dirname "$0")/../payway-payment-service" || exit
docker compose up -d

echo ""
echo "========================================================================="
echo " PayWay Payment Service is starting..."
echo " - Service Port   : 7073"
echo " - Health Endpoint: http://localhost:7073/actuator/health"
echo " - Swagger Docs   : http://localhost:7073/swagger-ui.html"
echo "========================================================================="
