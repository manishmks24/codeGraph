@echo off
setlocal enabledelayedexpansion

echo ===============================================================
echo   CodeGraph AI - Full Production Build Pipeline
echo ===============================================================
echo.

cd /d "%~dp0"

echo [1/3] Building React + Vite Frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend npm install failed.
    exit /b %ERRORLEVEL%
)

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed.
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [2/3] Copying Frontend bundle to Spring Boot static resources...
if not exist "backend\src\main\resources\static" mkdir "backend\src\main\resources\static"
xcopy /E /I /Y "frontend\dist\*" "backend\src\main\resources\static\"

echo.
echo [3/3] Packaging Executable Spring Boot Single-Artifact JAR...
cd backend
call mvnw.cmd clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend packaging failed.
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ===============================================================
echo   SUCCESS! Production Build Completed Successfully!
echo   Single Executable JAR: backend\target\archlens-backend-1.0.0.jar
echo   To run: start-production.bat or java -jar backend\target\archlens-backend-1.0.0.jar
echo ===============================================================
