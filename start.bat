@echo off
echo ===================================================
echo     Launching ArchLens AI Platform
echo ===================================================

echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "ArchLens Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo [2/2] Starting React Frontend (Port 3000)...
start "ArchLens Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8080
echo.
pause
