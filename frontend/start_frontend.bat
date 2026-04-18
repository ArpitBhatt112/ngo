@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing frontend dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Frontend dependency installation failed.
    exit /b 1
  )
)

echo Starting Vite frontend on http://127.0.0.1:5173
call npm run dev -- --host 127.0.0.1
