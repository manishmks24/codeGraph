@echo off
setlocal

cd /d "%~dp0"

if not exist "backend\target\archlens-backend-1.0.0.jar" (
    echo [INFO] JAR not found. Running full production build first...
    call build-all.bat
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Build failed.
        exit /b %ERRORLEVEL%
    )
)

echo ===============================================================
echo   Starting CodeGraph AI Standalone Production Server
echo   Port: %PORT% (Default: 8080)
echo   Open your browser at: http://localhost:8080
echo ===============================================================
echo.

if "%PORT%"=="" set PORT=8080

java -Xms256m -Xmx1024m -XX:+UseG1GC -Dserver.port=%PORT% -jar "backend\target\archlens-backend-1.0.0.jar"
