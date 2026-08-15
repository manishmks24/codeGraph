# ==============================================================================
# Stage 1: Build React/Vite Frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Build Spring Boot Standalone Executable JAR
# ==============================================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/pom.xml ./
# Cache dependencies in Docker layer
RUN mvn dependency:go-offline -B

COPY backend/src ./src

# Copy built React SPA bundle into Spring Boot's static resources directory
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

# Package single all-in-one runnable JAR
RUN mvn clean package -DskipTests

# ==============================================================================
# Stage 3: Lightweight Production JRE 21 Alpine Runtime
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Set production environment variables
ENV SPRING_PROFILES_ACTIVE=production \
    PORT=8080 \
    JAVA_OPTS="-Xms256m -Xmx1024m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

# Expose HTTP port (binds dynamically to $PORT in cloud providers like Cloud Run/Railway)
EXPOSE 8080

# Run with non-root security user
RUN addgroup -S codegraph && adduser -S codegraph -G codegraph
USER codegraph

# Copy standalone single-artifact JAR from build stage
COPY --from=backend-builder /app/backend/target/*.jar /app/app.jar

# Healthcheck for container orchestrators (Kubernetes, ECS, Docker Compose)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar /app/app.jar"]
