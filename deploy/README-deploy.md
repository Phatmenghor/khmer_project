# emenu-cambodia.com — Server Deployment Guide

## Architecture

| Domain | Service | Port |
|--------|---------|------|
| `emenu-cambodia.com` | Owner frontend (Next.js) | 3001 |
| `*.emenu-cambodia.com` | Customer frontend (Next.js) | 3000 |
| `api.emenu-cambodia.com` | Spring Boot backend | 7070 |

---

## Step 1 — GoDaddy DNS Records

Add these in GoDaddy DNS Manager for `emenu-cambodia.com`:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `@` | `<your-server-ip>` | 600 |
| A | `www` | `<your-server-ip>` | 600 |
| A | `api` | `<your-server-ip>` | 600 |
| A | `*` | `<your-server-ip>` | 600 |

> The `*` wildcard A record routes **all subdomains** to your server.  
> GoDaddy supports wildcard A records — just type `*` in the Host field.

---

## Step 2 — Get Wildcard SSL Certificate

On the server:

```bash
git pull   # make sure deploy/ files are up to date
chmod +x deploy/setup-ssl-emenu.sh
bash deploy/setup-ssl-emenu.sh
```

When certbot prompts, add **two TXT records** in GoDaddy DNS:
- Both named `_acme-challenge` (same name, two values)
- Wait ~2 min for DNS propagation, then press Enter

---

## Step 3 — Start the Applications

### Backend (Spring Boot)

```bash
# Upload your jar or use your existing deploy script
# Make sure application-prod.yaml has:
#   SERVER_PORT=7070
#   JWT_SECRET=<64+ char secret>
#   DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD
#   BACKEND_API_URL=https://api.emenu-cambodia.com

java -jar -Dspring.profiles.active=prod menu-scanner-backend.jar
# or with systemd (recommended — see below)
```

### Owner Frontend (port 3001)

```bash
cd menu-scanner-frontend-owner
# .env.production must have:
#   BACKEND_API_URL=http://127.0.0.1:7070
#   NEXT_PUBLIC_API_BASE_URL=/api
#   NEXT_PUBLIC_BASE_DOMAIN=emenu-cambodia.com

npm run build
PORT=3001 npm start
# or: node .next/standalone/server.js  (PORT=3001)
```

### Customer Frontend (port 3000)

```bash
cd menu-scanner-frontend-client
# .env.production must have:
#   BACKEND_API_URL=http://127.0.0.1:7070
#   NEXT_PUBLIC_API_BASE_URL=/api
#   NEXT_PUBLIC_BASE_DOMAIN=emenu-cambodia.com

npm run build
PORT=3000 npm start
```

---

## Step 4 — Systemd Services (recommended)

Create `/etc/systemd/system/emenu-backend.service`:

```ini
[Unit]
Description=emenu Backend
After=network.target

[Service]
User=root
WorkingDirectory=/opt/emenu
ExecStart=java -jar -Dspring.profiles.active=prod /opt/emenu/menu-scanner-backend.jar
EnvironmentFile=/opt/emenu/.env.prod
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/emenu-owner.service`:

```ini
[Unit]
Description=emenu Owner Frontend
After=network.target

[Service]
User=root
WorkingDirectory=/opt/emenu/owner
Environment=PORT=3001
Environment=NODE_ENV=production
ExecStart=node .next/standalone/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/emenu-client.service`:

```ini
[Unit]
Description=emenu Client Frontend
After=network.target

[Service]
User=root
WorkingDirectory=/opt/emenu/client
Environment=PORT=3000
Environment=NODE_ENV=production
ExecStart=node .next/standalone/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now emenu-backend emenu-owner emenu-client
```

---

## Step 5 — Verify

```bash
# Health checks
curl https://emenu-cambodia.com/health
curl https://api.emenu-cambodia.com/health
curl https://test.emenu-cambodia.com/health   # any subdomain

# Check SSL covers wildcard
openssl s_client -connect test.emenu-cambodia.com:443 -servername test.emenu-cambodia.com 2>/dev/null | grep subject
```

---

## Environment Files Summary

### `/opt/emenu/.env.prod` (backend)

```env
SERVER_PORT=7070
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<minimum 64 character random string>
DATABASE_URL=jdbc:postgresql://localhost:5432/emenu_db
DATABASE_USERNAME=emenu_user
DATABASE_PASSWORD=<password>
```

### `/opt/emenu/owner/.env.production`

```env
BACKEND_API_URL=http://127.0.0.1:7070
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_BASE_DOMAIN=emenu-cambodia.com
```

### `/opt/emenu/client/.env.production`

```env
BACKEND_API_URL=http://127.0.0.1:7070
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_BASE_DOMAIN=emenu-cambodia.com
```

> `NEXT_PUBLIC_API_BASE_URL` is intentionally empty — the catch-all API proxy
> (`/api/[...path]/route.ts`) uses `BACKEND_API_URL` (server-side only) to
> forward requests, so the browser never needs to know the backend URL directly.
