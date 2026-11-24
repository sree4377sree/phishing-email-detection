@echo off
cd /d "%~dp0"

echo ========================================================
echo   PhishShield AI - Django AI Backend
echo ========================================================

echo [*] Applying migrations...
python manage.py migrate

echo [*] Starting server on http://127.0.0.1:8000 ...
python manage.py runserver 127.0.0.1:8000
pause
