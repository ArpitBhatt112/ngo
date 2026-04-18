@echo off
setlocal
cd /d "%~dp0"

start "CareBridge Backend" cmd /k call "%~dp0backend\start_backend.bat"
start "CareBridge Frontend" cmd /k call "%~dp0frontend\start_frontend.bat"

echo CareBridge startup scripts launched.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
