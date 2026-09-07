# Multi-stage Dockerfile for PayWay Payment Gateway Microservice
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
EXPOSE 7073
COPY --from=builder /app/target/payway-payment-service-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
