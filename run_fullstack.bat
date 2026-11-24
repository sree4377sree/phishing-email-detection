@echo off
cd /d "%~dp0"

echo ========================================================
echo   PhishShield AI - Starting Full-Stack System
echo   Backend: http://127.0.0.1:8000
echo   Frontend (React): http://localhost:5173
echo ========================================================

echo [*] Applying database migrations...
python manage.py migrate

echo [*] Launching React Development Server in new window...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo [*] Launching Django AI Backend on port 8000...
python manage.py runserver 127.0.0.1:8000
pause
