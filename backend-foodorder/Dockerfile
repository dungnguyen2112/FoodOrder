# Stage 1: build
FROM maven:3.8.4-openjdk-17 AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN mvn package -DskipTests

# Stage 2: create image
FROM openjdk:17-slim

WORKDIR /app
COPY --from=build /app/target/*.jar backend.jar

CMD ["java", "-jar", "backend.jar", "-Dspring.profiles.active=docker"]
