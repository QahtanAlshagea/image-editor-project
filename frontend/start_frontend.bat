@echo off
cd /d "%~dp0"
title Lumen Studio - Frontend (Port 5173)

echo ===================================================
echo   Lumen Studio - Frontend Server (React Vite)
echo ===================================================
echo.

if not exist "node_modules" (
    echo node_modules not found. Running npm install...
    call npm install
)

echo Starting Vite on http://localhost:5173 ...
call npm run dev

echo.
echo Server stopped.
pause
