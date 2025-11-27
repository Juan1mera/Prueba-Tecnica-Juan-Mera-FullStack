FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/tasksync-0.0.1-SNAPSHOT.jar app.jar

ENV DB_URL=jdbc:mysql://mysql:3306/tasksync_db
ENV DB_USERNAME=tasksync_user
ENV DB_PASSWORD=secret123
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 3000

ENTRYPOINT ["java", "-jar", "app.jar", "--server.address=0.0.0.0", "--server.port=3000"]