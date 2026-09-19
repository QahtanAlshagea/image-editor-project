@echo off
setlocal
title Lumen Studio - Stop Services

echo ===================================================
echo             LUMEN STUDIO - STOPPING
echo ===================================================
echo.
echo Stopping servers on ports 5000 and 5173...

powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo All services stopped successfully.
ping 127.0.0.1 -n 3 >nul
