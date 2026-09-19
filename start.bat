@echo off
setlocal
title Lumen Studio - Launcher
cd /d "%~dp0"

echo ===================================================
echo             LUMEN STUDIO - STARTING
echo ===================================================
echo.

:: 1. Verify Python Virtual Environment
if not exist "%~dp0backend\.venv\Scripts\python.exe" (
    echo [1/3] Setting up Python virtual environment...
    cd /d "%~dp0backend"
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd /d "%~dp0"
) else (
    echo [1/3] Python environment: OK
)

:: 2. Verify Frontend node_modules
if not exist "%~dp0frontend\node_modules" (
    echo [2/3] Installing frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
) else (
    echo [2/3] Frontend dependencies: OK
)

:: 3. Start Backend in separate window
echo [3/3] Starting Backend server on port 5000...
start "Lumen Studio - Backend" /D "%~dp0backend" cmd /k ".venv\Scripts\python.exe run.py"

:: 4. Start Frontend in separate window
echo Starting Frontend server on port 5173...
start "Lumen Studio - Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

:: 5. Open browser
echo.
echo ===================================================
echo   Services are starting! Opening browser...
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ===================================================
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173
