# Grouped Docker Infrastructure & Deployment Services

This directory contains the grouped Docker infrastructure setup for deploying **PostgreSQL**, **pgAdmin 4**, and **Resource Storage Service**.

---

## 📁 Directory Structure

```text
docker/
├── .env                            # Active environment configuration
├── .env.example                    # Environment template
├── docker-compose.yml              # Unified Docker Compose manifest
├── init-scripts/
│   └── 01-init-databases.sql       # Auto-creates 'resource_storage_service' & 'e_menu_platform' databases
├── pgadmin/
│   └── servers.json                # Auto-registers PostgreSQL inside pgAdmin
├── start-postgres-only.bat / .sh   # Step 1: Deploy PostgreSQL + pgAdmin
├── start-resource-storage.bat / .sh# Step 2: Deploy Resource Storage Service
├── start-all.bat / .sh             # Deploy all services together
└── stop-all.bat / .sh              # Stop and cleanup containers
```

---

## 🔑 Complete pgAdmin Login & Registration Guide

### 1. Accessing pgAdmin
- **URL**: `http://localhost:5050`
- **Email**: `admin@admin.com`
- **Password**: `admin123`

---

### 2. Auto-Registered Server (Pre-Configured)
PostgreSQL is **automatically registered** on startup under the name **`Khmer Postgres Server`**.
- Double-click **`Khmer Postgres Server`** in the left sidebar menu.
- Enter the PostgreSQL Password: **`Hour1819`** (Check "Save Password").

---

### 3. Manual Server Registration (If needed)

If registering manually in pgAdmin:
1. Click **Add New Server** on the pgAdmin Dashboard.
2. In the **General** tab:
   - **Name**: `Khmer Postgres` (or any custom name)
3. In the **Connection** tab:
   - **Host name/address**: `postgres` *(if running inside Docker)* or `localhost` *(if connecting from local machine host)*
   - **Port**: `5432`
   - **Maintenance database**: `postgres`
   - **Username**: `postgres`
   - **Password**: `Hour1819`
   - Check **Save password?**
4. Click **Save**.

---

## 🚀 Quick Start Guide

### Step 1: Deploy PostgreSQL + pgAdmin First

#### Windows:
```cmd
.\start-postgres-only.bat
```

#### Linux / macOS:
```bash
chmod +x *.sh
./start-postgres-only.sh
```

---

### Step 2: Deploy Resource Storage Service

```cmd
.\start-resource-storage.bat
```

---

## 🌐 Summary Table

| Service | Host Port | Web Access / URL | Login Credentials |
| :--- | :--- | :--- | :--- |
| **pgAdmin 4** | `5050` | `http://localhost:5050` | `admin@admin.com` / `admin123` |
| **PostgreSQL** | `5432` | `postgres:5432` | User: `postgres`, Pass: `Hour1819` |
| **Resource Storage** | `7072` | `http://localhost:7072/actuator/health` | Service API |
