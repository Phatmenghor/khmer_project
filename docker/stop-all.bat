@echo off
echo =========================================================================
echo  Stopping All Docker Services
echo =========================================================================

cd /d "%~dp0"
docker compose down

echo.
echo All services stopped successfully.
pause
