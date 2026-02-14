@echo off
cd /d C:\dev\pmerit\pmerit-technologies\products\aixord-webapp-ui
echo Building frontend...
call npm run build
if errorlevel 1 (
  echo Build failed but continuing with deployment...
)
echo.
echo Deploying to Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=aixord-webapp-ui
