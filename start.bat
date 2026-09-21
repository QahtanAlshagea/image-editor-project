@echo off
cd /d "%~dp0"
title Lumen Studio - Launcher

echo ===================================================
echo             LUMEN STUDIO - STARTING
echo ===================================================
echo.
echo Current directory: %cd%
echo.

:: 1. Start Backend in separate window
echo [1/2] Starting Backend server on port 5000...
start "" "%~dp0backend\start_backend.bat"

:: 2. Start Frontend in separate window
echo [2/2] Starting Frontend server on port 5173...
start "" "%~dp0frontend\start_frontend.bat"

:: 3. Open browser
echo.
echo ===================================================
echo   Services are starting!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
echo   Opening browser in 4 seconds...
echo ===================================================
ping 127.0.0.1 -n 5 >nul
start http://localhost:5173
