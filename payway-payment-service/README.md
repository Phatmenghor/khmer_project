# Production & Staging Deployment Guide

## 1. Production Docker Deployment (Recommended)

Deploying `payway-payment-service` as an isolated containerized service using Docker Compose:

```bash
# 1. Clone or pull the latest code repository
git pull origin main

# 2. Build and start the container in detached mode
docker compose up -d --build

# 3. Verify that the container is healthy and running
docker compose ps
```

---

## 2. Updating / Rolling Redeployments

To update the running deployment with zero service downtime:

```bash
# Pull new changes
git pull origin main

# Rebuild and replace running container seamlessly
docker compose up -d --build --no-deps payway-payment-service
```

---

## 3. Container Management Commands

```bash
# View live real-time logs
docker compose logs -f payway-payment-service

# Stop the containerized deployment
docker compose down

# Restart the service
docker compose restart payway-payment-service

# View container resource utilization (CPU / RAM)
docker stats payway-payment-service
```

---

## 4. Health Check Verification

After deployment, verify system readiness:

```bash
# Actuator Health Check Endpoint
curl -i http://localhost:7073/actuator/health

# Expect response: {"status":"UP"}
```
