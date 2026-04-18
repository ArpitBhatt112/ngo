@echo off
setlocal
cd /d "%~dp0"

set "PYTHON_CMD="

where py >nul 2>nul
if not errorlevel 1 (
  py -3.13 --version >nul 2>nul
  if not errorlevel 1 set "PYTHON_CMD=py -3.13"
)

if not defined PYTHON_CMD (
  python --version >nul 2>nul
  if errorlevel 1 (
    echo Python was not found.
    echo Please install Python 3.13 and run this script again.
    exit /b 1
  )
  set "PYTHON_CMD=python"
)

if not exist ".packages\fastapi" (
  echo Installing backend dependencies...
  call %PYTHON_CMD% -m pip install -r requirements.txt --target .packages
  if errorlevel 1 (
    echo.
    echo Backend dependency installation failed.
    echo Recommended fix: install Python 3.13 and run this script again.
    exit /b 1
  )
)

echo Starting FastAPI backend on http://127.0.0.1:8000
call %PYTHON_CMD% run_server.py
