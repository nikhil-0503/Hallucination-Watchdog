# Quick Start Script for Hallucination Watchdog
# Run this script from the project root directory

Write-Host "🚀 Starting Hallucination Watchdog..." -ForegroundColor Green

# Step 1: Check if .venv exists
if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
    & ".\.venv\Scripts\Activate.ps1"
} else {
    Write-Host "⚠️  Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    & ".\.venv\Scripts\Activate.ps1"
    pip install --upgrade pip
    cd backend
    pip install -r requirements.txt
    cd ..
}

# Step 2: Configure frontend environment
Write-Host "🔧 Configuring frontend environment..." -ForegroundColor Green
$envContent = "REACT_APP_API_URL=http://localhost:8000"
if (!(Test-Path "frontend\.env.local")) {
    Set-Content -Path "frontend\.env.local" -Value $envContent
    Write-Host "✅ Created frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "✅ frontend/.env.local already exists" -ForegroundColor Green
}

Write-Host "`n📋 To start the application:" -ForegroundColor Cyan
Write-Host "  Terminal 1 (Backend):"
Write-Host "    cd backend"
Write-Host "    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Write-Host ""
Write-Host "  Terminal 2 (Frontend):"
Write-Host "    cd frontend"
Write-Host "    npm start"
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Detailed setup guide: Read QUICK_FIX.md" -ForegroundColor Yellow
