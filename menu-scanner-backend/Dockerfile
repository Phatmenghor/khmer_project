# =========================
# Build stage
# =========================
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Cache dependencies layer — only re-downloads when pom.xml changes
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

COPY src ./src
RUN mvn clean package -DskipTests -T 1C -q

# Extract layered JAR for optimal Docker layer caching
RUN java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted


# =========================
# Runtime stage
# =========================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user — never run as root in production
RUN addgroup -S emenu && adduser -S emenu -G emenu

WORKDIR /app

# Layered JAR: dependencies change rarely → cached; app code changes often → small layer
COPY --from=build --chown=emenu:emenu /app/target/extracted/dependencies/           ./
COPY --from=build --chown=emenu:emenu /app/target/extracted/spring-boot-loader/     ./
COPY --from=build --chown=emenu:emenu /app/target/extracted/snapshot-dependencies/  ./
COPY --from=build --chown=emenu:emenu /app/target/extracted/application/            ./

USER emenu

EXPOSE 7070

# ZGC with generational mode (Java 21) — low-latency GC ideal for API workloads
# UseContainerSupport + MaxRAMPercentage respect Kubernetes/Docker memory limits
ENTRYPOINT ["java", \
  "-XX:+UseZGC", \
  "-XX:+ZGenerational", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+ExitOnOutOfMemoryError", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-cp", "BOOT-INF/classes:BOOT-INF/lib/*", \
  "org.springframework.boot.loader.launch.JarLauncher"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD wget -q --spider http://localhost:7070/actuator/health || exit 1
