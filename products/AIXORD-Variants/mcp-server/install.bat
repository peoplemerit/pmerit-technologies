@echo off
set PATH=C:\dev\pmerit\.node\node-v20.18.1-win-x64;%PATH%
cd /d "%~dp0"
npm install
npm run build
pause
