@echo off
echo =========================================================================
echo  Starting Resource Storage Service
echo =========================================================================

cd /d "%~dp0"
docker compose up -d resource-storage-service

echo.
echo =========================================================================
echo  Resource Storage Service is starting...
echo  - Service Port : 7072
echo  - Health Endpoint: http://localhost:7072/actuator/health
echo =========================================================================
pause
