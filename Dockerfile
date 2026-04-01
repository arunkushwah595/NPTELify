# Simple single-stage Dockerfile
FROM maven:3.9.6-eclipse-temurin-17-alpine

WORKDIR /app

# Copy entire project
COPY . .

# Build backend JAR
WORKDIR /app/backend
RUN mvn clean package -DskipTests -q

# Set working directory back to app root
WORKDIR /app

# Expose port
EXPOSE 8080

# Run the JAR
ENTRYPOINT ["java", "-Dserver.port=8080", "-jar", "/app/backend/target/nptelify-0.0.1-SNAPSHOT.jar"]
