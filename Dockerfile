# Build stage - Railway rebuild 2026-04-01
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy entire project
COPY . .

# Build the backend
RUN cd backend && mvn clean package -DskipTests -o || mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy built JAR from builder
COPY --from=builder /app/backend/target/nptelify-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Set default PORT if not provided by Railway
ENV PORT=8080

# Run the application using shell form for better env var handling
CMD java -Dserver.port=${PORT} -jar app.jar
