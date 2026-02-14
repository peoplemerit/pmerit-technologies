@echo off
cd /d C:\dev\pmerit\pmerit-technologies\products\aixord-webapp-ui
echo Testing TypeScript compilation...
call npm run build
if errorlevel 1 (
  echo BUILD FAILED
  exit /b 1
) else (
  echo BUILD SUCCESSFUL
  exit /b 0
)
