@echo off
cd /d "%~dp0"
title Lumen Studio - Backend (Port 5000)

echo ===================================================
echo   Lumen Studio - Backend Server (Python Flask)
echo ===================================================
echo.

if not exist ".venv\Scripts\python.exe" (
    echo Python virtual environment not found. Creating .venv...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)

echo Starting Flask on http://127.0.0.1:5000 ...
python run.py

echo.
echo Server stopped.
pause
