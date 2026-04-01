# Multi-stage build for NPTELify Backend
FROM maven:3.9.6-eclipse-temurin-17 as BUILD

WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Final image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
COPY --from=BUILD /app/backend/target/nptelify-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

CMD ["java", "-Dserver.port=8080", "-jar", "app.jar"]
