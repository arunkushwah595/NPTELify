# NPTELify Backend Setup Guide

## Prerequisites
- Java 21+
- PostgreSQL 18+
- Maven 3.8+

## Configuration

### 1. Create `application.properties`
Copy the example configuration file and update with your values:

```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

### 2. Database Setup
Create a PostgreSQL database and user:

```sql
CREATE DATABASE nptelify;
CREATE USER nptelify_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nptelify TO nptelify_user;
```

### 3. Update `application.properties`
Edit `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/nptelify
spring.datasource.username=nptelify_user
spring.datasource.password=your_password_here
```

### 4. JWT Configuration
Set a strong JWT secret (for production):

```properties
app.jwt.secret=your-secure-jwt-secret-key-minimum-32-characters
```

Or use environment variable:
```bash
export JWT_SECRET="your-secure-jwt-secret-key"
```

## Build & Run

### Build
```bash
mvn clean package -DskipTests
```

### Run
```bash
mvn spring-boot:run
```

Or run the JAR:
```bash
java -jar target/nptelify-0.0.1-SNAPSHOT.jar
```

The backend will be available at `http://localhost:8080`

## Environment Variables (Optional)
Instead of editing `application.properties`, you can set environment variables:

- `DB_URL` - Database URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key

## Notes
- **DO NOT commit `application.properties` with real credentials to version control**
- Use `application.properties.example` as a template
- For production, configure environment variables securely
