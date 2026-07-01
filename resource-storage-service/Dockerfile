FROM eclipse-temurin:21-jre-alpine
LABEL maintainer="resource-storage"
LABEL description="Resource Storage Backend API"

WORKDIR /app

# Install ffmpeg for AVIF / HEIC / camera-RAW decoding.
# TwelveMonkeys handles JPEG, PNG, WebP, TIFF, BMP, PSD, etc. in pure Java.
# ffmpeg is only invoked when ImageIO (+ TwelveMonkeys) cannot decode the file.
RUN apk add --no-cache ffmpeg

COPY resource_storage_service.jar .

EXPOSE 7072

ENTRYPOINT ["java", \
  "-XX:+UseZGC", \
  "-XX:+ZGenerational", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=90.0", \
  "-XX:InitialRAMPercentage=50.0", \
  "-XX:+AlwaysPreTouch", \
  "-XX:+TieredCompilation", \
  "-XX:+OptimizeStringConcat", \
  "-XX:+ExitOnOutOfMemoryError", \
  "-XX:+HeapDumpOnOutOfMemoryError", \
  "-XX:HeapDumpPath=/app/logs/heapdump.hprof", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "/app/resource_storage_service.jar"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD wget -q --spider http://localhost:7072/actuator/health || exit 1
