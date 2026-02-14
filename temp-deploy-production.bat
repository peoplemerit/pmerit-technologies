@echo off
cd /d C:\dev\pmerit\pmerit-technologies\products\aixord-webapp-ui
echo Deploying to production domain: aixord.pmerit.com
call npx wrangler pages deploy dist --project-name=aixord-webapp-ui --branch=production
