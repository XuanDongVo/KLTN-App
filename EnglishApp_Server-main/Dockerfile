# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy gradle files
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Copy source code
COPY src src

# Make wrapper executable and build the jar
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built jar from the build stage
COPY --from=build /app/build/libs/*SNAPSHOT.jar app.jar

# Expose port and run the application
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
