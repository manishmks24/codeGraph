#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if [ ! -f "backend/target/archlens-backend-1.0.0.jar" ]; then
    echo "[INFO] JAR not found. Running full production build first..."
    ./build-all.sh
fi

PORT="${PORT:-8080}"

echo "==============================================================="
echo "  Starting CodeGraph AI Standalone Production Server"
echo "  Port: $PORT"
echo "  Open your browser at: http://localhost:$PORT"
echo "==============================================================="
echo ""

exec java -Xms256m -Xmx1024m -XX:+UseG1GC -Dserver.port="$PORT" -jar "backend/target/archlens-backend-1.0.0.jar"
