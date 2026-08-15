#!/bin/bash
set -e

echo "==============================================================="
echo "  CodeGraph AI - Full Production Build Pipeline (Linux/macOS)"
echo "==============================================================="
echo ""

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "[1/3] Building React + Vite Frontend..."
cd frontend
npm ci || npm install
npm run build
cd ..

echo ""
echo "[2/3] Copying Frontend bundle to Spring Boot static resources..."
mkdir -p backend/src/main/resources/static
cp -r frontend/dist/* backend/src/main/resources/static/

echo ""
echo "[3/3] Packaging Executable Spring Boot Single-Artifact JAR..."
cd backend
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw clean package -DskipTests
else
    mvn clean package -DskipTests
fi
cd ..

echo ""
echo "==============================================================="
echo "  SUCCESS! Production Build Completed Successfully!"
echo "  Single Executable JAR: backend/target/archlens-backend-1.0.0.jar"
echo "  To run: java -jar backend/target/archlens-backend-1.0.0.jar"
echo "==============================================================="
