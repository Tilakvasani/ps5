@echo off
echo 🚀 GLOW BEYOND - Quick Start Setup
echo ==================================

REM Frontend Setup
echo.
echo 📦 Installing Frontend Dependencies...
cd web
call npm install
echo ✅ Frontend dependencies installed

REM Backend Setup
echo.
echo 🐍 Setting up Backend...
cd ../api

REM Create virtual environment
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt
echo ✅ Backend dependencies installed

echo.
echo ==================================
echo ✅ Setup Complete!
echo.
echo 🚀 To start the application:
echo.
echo 1. Start Backend (Terminal 1):
echo    cd api
echo    .venv\Scripts\activate
echo    uvicorn app.main:app --reload
echo.
echo 2. Start Frontend (Terminal 2):
echo    cd web
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:3000
echo.
echo ==================================
pause
