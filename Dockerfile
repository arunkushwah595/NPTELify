# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy entire project
COPY . .

# Build the backend
RUN cd backend && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy built JAR from builder
COPY --from=builder /app/backend/target/nptelify-0.0.1-SNAPSHOT.jar .

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-Dserver.port=8080", "-jar", "nptelify-0.0.1-SNAPSHOT.jar"]
