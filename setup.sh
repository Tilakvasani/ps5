#!/bin/bash
echo "🚀 GLOW BEYOND - Quick Start Setup"
echo "=================================="

# Frontend Setup
echo ""
echo "📦 Installing Frontend Dependencies..."
cd web
npm install
echo "✅ Frontend dependencies installed"

# Backend Setup
echo ""
echo "🐍 Setting up Backend..."
cd ../api

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source .venv/Scripts/activate
else
    source .venv/bin/activate
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "✅ Backend dependencies installed"

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd api"
echo "   source .venv/bin/activate  # or .venv\\Scripts\\activate on Windows"
echo "   uvicorn app.main:app --reload"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd web"
echo "   npm run dev"
echo ""
echo "3. Open browser: http://localhost:3000"
echo ""
echo "=================================="
