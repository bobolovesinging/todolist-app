@echo off
cd /d "%~dp0"
echo Starting Todo List App (dev mode)...
call npx tauri dev
pause
