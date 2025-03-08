# Stage 1: Build the application
FROM gradle:8.7-jdk17 AS build
COPY --chown=gradle:gradle . /hoidanit/jobhunter
WORKDIR /hoidanit/jobhunter

#skip task: test
RUN gradle clean build -x test --no-daemon

# Stage 2: Run the application
FROM openjdk:17-slim
EXPOSE 8080
COPY --from=build /hoidanit/jobhunter/build/libs/*.jar /hoidanit/spring-boot-job-hunter.jar
ENTRYPOINT ["java", "-jar", "/hoidanit/spring-boot-job-hunter.jar"]
