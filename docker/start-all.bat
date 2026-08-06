@echo off
echo =========================================================================
echo  Starting All Services (Postgres + Resource Storage Service)
echo =========================================================================

cd /d "%~dp0"
docker compose up -d

echo.
echo =========================================================================
echo  All Services Started!
echo  - Postgres Database       : localhost:5432
echo  - Resource Storage Service: http://localhost:7072
echo =========================================================================
pause
