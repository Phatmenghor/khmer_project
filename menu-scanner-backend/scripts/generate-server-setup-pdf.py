"""
Generate eMenu Cambodia Server Setup Guide as PDF.
Run: python3 generate-server-setup-pdf.py
Output: eMenu_Cambodia_Server_Setup_Guide.pdf
"""

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, HRFlowable, PageBreak, Preformatted)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus.flowables import KeepTogether

OUTPUT = "/home/user/khmer_project/eMenu_Cambodia_Server_Setup_Guide.pdf"

# ── Colors ────────────────────────────────────────────────────────────────────
ORANGE  = colors.HexColor("#E86B00")
DARK    = colors.HexColor("#1E1E2E")
WHITE   = colors.white
LGRAY   = colors.HexColor("#F5F5F5")
MGRAY   = colors.HexColor("#646478")
GREEN   = colors.HexColor("#22C55E")
BLUE    = colors.HexColor("#388BFD")
RED     = colors.HexColor("#EF4444")
CODE_BG = colors.HexColor("#1E1E2E")
CODE_FG = colors.HexColor("#22C55E")

W, H = landscape(A4)

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=landscape(A4),
    leftMargin=1.5*cm, rightMargin=1.5*cm,
    topMargin=1.2*cm, bottomMargin=1.2*cm,
)

styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

title_style    = S("Title2",   fontSize=26, textColor=WHITE,  leading=32, alignment=TA_LEFT, fontName="Helvetica-Bold")
h1_style       = S("H1",       fontSize=18, textColor=DARK,   leading=24, alignment=TA_LEFT, fontName="Helvetica-Bold", spaceAfter=4)
h2_style       = S("H2",       fontSize=13, textColor=ORANGE, leading=18, alignment=TA_LEFT, fontName="Helvetica-Bold", spaceAfter=2)
body_style     = S("Body2",    fontSize=10, textColor=DARK,   leading=15, alignment=TA_LEFT, fontName="Helvetica")
small_style    = S("Small",    fontSize=8,  textColor=MGRAY,  leading=12, alignment=TA_LEFT, fontName="Helvetica")
note_style     = S("Note",     fontSize=9,  textColor=RED,    leading=13, alignment=TA_LEFT, fontName="Helvetica-Oblique")
code_style     = S("Code2",    fontSize=8,  textColor=CODE_FG,leading=12, alignment=TA_LEFT, fontName="Courier",
                   backColor=CODE_BG, leftIndent=8, rightIndent=8, spaceAfter=2, spaceBefore=2)
bullet_style   = S("Bullet2",  fontSize=10, textColor=DARK,   leading=15, alignment=TA_LEFT, fontName="Helvetica",
                   leftIndent=14, firstLineIndent=-10)
white_style    = S("White",    fontSize=10, textColor=WHITE,  leading=14, alignment=TA_LEFT, fontName="Helvetica")
white_bold     = S("WhiteBold",fontSize=11, textColor=WHITE,  leading=15, alignment=TA_LEFT, fontName="Helvetica-Bold")
center_style   = S("Center2",  fontSize=10, textColor=DARK,   leading=14, alignment=TA_CENTER, fontName="Helvetica")
orange_center  = S("OCenter",  fontSize=13, textColor=ORANGE, leading=18, alignment=TA_CENTER, fontName="Helvetica-Bold")


def orange_header(title, subtitle=None):
    data = [[Paragraph(title, S("TH", fontSize=20, textColor=WHITE, leading=26,
                                fontName="Helvetica-Bold", alignment=TA_LEFT))]]
    if subtitle:
        data.append([Paragraph(subtitle, S("TS", fontSize=10, textColor=colors.HexColor("#FFDDAA"),
                                           leading=14, fontName="Helvetica", alignment=TA_LEFT))])
    t = Table(data, colWidths=[W - 3*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), ORANGE),
        ("LEFTPADDING",  (0,0), (-1,-1), 12),
        ("RIGHTPADDING", (0,0), (-1,-1), 12),
        ("TOPPADDING",   (0,0), (-1,-1), 8),
        ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ]))
    return t


def code_block(lines):
    joined = "\n".join(lines)
    return Preformatted(joined, code_style)


def info_table(rows, col_w=None):
    data = [[Paragraph(k, S("IK", fontSize=9, textColor=WHITE, fontName="Helvetica-Bold")),
             Paragraph(v, S("IV", fontSize=9, textColor=DARK,  fontName="Helvetica"))]
            for k, v in rows]
    cw = col_w or [4*cm, W - 3*cm - 4*cm]
    t = Table(data, colWidths=cw)
    t.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (0,-1), ORANGE),
        ("BACKGROUND",   (1,0), (1,-1), LGRAY),
        ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING",   (0,0), (-1,-1), 5),
        ("BOTTOMPADDING",(0,0), (-1,-1), 5),
        ("ROWBACKGROUNDS",(1,0),(1,-1),[LGRAY, WHITE]),
        ("GRID",         (0,0), (-1,-1), 0.5, colors.HexColor("#DDDDDD")),
    ]))
    return t


def bullet(text):
    return Paragraph("• " + text, bullet_style)


def sp(n=6):
    return Spacer(1, n)


def section_title(text):
    return Paragraph(text, h2_style)


story = []

# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — Title
# ═══════════════════════════════════════════════════════════════════════════════
title_data = [
    [Paragraph("eMenu Cambodia", S("T1", fontSize=34, textColor=WHITE, fontName="Helvetica-Bold", leading=40))],
    [Paragraph("Server Setup Guide", S("T2", fontSize=26, textColor=ORANGE, fontName="Helvetica", leading=32))],
    [Spacer(1, 10)],
    [Paragraph("Complete step-by-step deployment &amp; configuration reference",
               S("T3", fontSize=13, textColor=colors.HexColor("#AAAABB"), fontName="Helvetica", leading=18))],
    [Spacer(1, 6)],
    [Paragraph("Domain: emenu-cambodia.com  •  Server IP: 167.172.88.194  •  OS: Ubuntu Linux",
               S("T4", fontSize=10, textColor=colors.HexColor("#888899"), fontName="Helvetica", leading=14))],
    [Spacer(1, 6)],
    [Paragraph("Last Updated: June 2026",
               S("T5", fontSize=9, textColor=colors.HexColor("#666677"), fontName="Helvetica", leading=12))],
]
title_tbl = Table(title_data, colWidths=[W - 3*cm])
title_tbl.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,-1), DARK),
    ("LEFTPADDING",   (0,0), (-1,-1), 24),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("TOPPADDING",    (0,0), (0,0), 60),
    ("BOTTOMPADDING", (0,-1),(-1,-1), 60),
]))
story.append(title_tbl)
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — Architecture Overview
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Architecture Overview", "All services run in Docker on a single Linux VPS"))
story.append(sp(10))

arch_data = [
    [Paragraph("Component", white_bold), Paragraph("Domain / Access", white_bold),
     Paragraph("Port", white_bold), Paragraph("Technology", white_bold)],
    [Paragraph("Nginx Reverse Proxy", body_style), Paragraph("All public traffic", body_style),
     Paragraph("80 / 443", body_style), Paragraph("Nginx + Wildcard SSL (acme.sh)", body_style)],
    [Paragraph("Owner Frontend", body_style), Paragraph("emenu-cambodia.com", S("OL", fontSize=10, textColor=ORANGE, fontName="Helvetica")),
     Paragraph("3000", body_style), Paragraph("Next.js 14 standalone", body_style)],
    [Paragraph("Client Frontend", body_style), Paragraph("*.emenu-cambodia.com", S("OL2", fontSize=10, textColor=ORANGE, fontName="Helvetica")),
     Paragraph("3001", body_style), Paragraph("Next.js 14 standalone", body_style)],
    [Paragraph("Spring Boot Backend", body_style), Paragraph("api.emenu-cambodia.com", S("OL3", fontSize=10, textColor=ORANGE, fontName="Helvetica")),
     Paragraph("7070", body_style), Paragraph("Java 21 + Spring Boot 3", body_style)],
    [Paragraph("PostgreSQL 17", body_style), Paragraph("Internal only", small_style),
     Paragraph("5432", body_style), Paragraph("Primary database", body_style)],
    [Paragraph("Redis 7", body_style), Paragraph("Internal only", small_style),
     Paragraph("6379", body_style), Paragraph("Cache (6 h TTL)", body_style)],
]
arch_tbl = Table(arch_data, colWidths=[5*cm, 6*cm, 2.5*cm, None])
arch_tbl.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), DARK),
    ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
    ("ROWBACKGROUNDS",(0,1),(-1,-1), [LGRAY, WHITE]),
    ("GRID",          (0,0), (-1,-1), 0.5, colors.HexColor("#DDDDDD")),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("RIGHTPADDING",  (0,0), (-1,-1), 8),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story.append(arch_tbl)
story.append(sp(10))
story.append(Paragraph("SSL: Wildcard certificate *.emenu-cambodia.com issued by Let's Encrypt via acme.sh + GoDaddy DNS API. "
                        "Auto-renews every ~60 days via cron.", note_style))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — Server Info & Directory Structure
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Server Information & Directory Structure"))
story.append(sp(10))

story.append(section_title("Server Details"))
story.append(sp(4))
story.append(info_table([
    ("VPS Provider",  "DigitalOcean / any Linux VPS"),
    ("Server IP",     "167.172.88.194"),
    ("OS",            "Ubuntu Linux"),
    ("Domain",        "emenu-cambodia.com  (GoDaddy DNS)"),
    ("Nameservers",   "ns47.domaincontrol.com / ns48.domaincontrol.com"),
    ("SSH Access",    "ssh root@167.172.88.194"),
]))
story.append(sp(14))

story.append(section_title("Directory Structure on Server"))
story.append(sp(4))
story.append(code_block([
    "/opt/apps/",
    "├── emenu-backend/",
    "│   ├── e_menu_cambodia.jar      ← Spring Boot fat-jar (built from source)",
    "│   ├── Dockerfile",
    "│   └── docker-compose.yml",
    "├── owner-frontend/",
    "│   ├── Dockerfile               ← Next.js standalone build, PORT=3000",
    "│   └── docker-compose.yml",
    "└── client-frontend/",
    "    ├── Dockerfile               ← Next.js standalone build, PORT=3001",
    "    └── docker-compose.yml",
    "",
    "/etc/nginx/conf.d/",
    "├── emenu-owner.conf             ← emenu-cambodia.com        → :3000",
    "├── emenu-api.conf               ← api.emenu-cambodia.com    → :7070",
    "└── emenu-client.conf            ← *.emenu-cambodia.com      → :3001",
    "",
    "/etc/ssl/emenu-cambodia/         ← SSL certificates (managed by acme.sh)",
    "├── fullchain.pem",
    "└── key.pem",
]))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 4 — SSL Certificate Setup
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("SSL Certificate Setup", "Wildcard cert via acme.sh + GoDaddy DNS API"))
story.append(sp(10))

story.append(info_table([
    ("Tool",          "acme.sh  (Let's Encrypt ACME client)"),
    ("Type",          "Wildcard  *.emenu-cambodia.com  +  emenu-cambodia.com"),
    ("DNS Provider",  "GoDaddy  (API Key + Secret — regenerate after each use!)"),
    ("Cert path",     "/etc/ssl/emenu-cambodia/fullchain.pem"),
    ("Key path",      "/etc/ssl/emenu-cambodia/key.pem"),
    ("Auto-renew",    "cron job runs daily at 11:44 — renews ~every 60 days automatically"),
]))
story.append(sp(12))

story.append(section_title("Commands"))
story.append(sp(4))
story.append(code_block([
    "# 1. Install acme.sh (one-time)",
    'curl https://get.acme.sh | sh -s email=phatmenghor19@gmail.com',
    "",
    "# 2. Set GoDaddy API credentials",
    'export GD_Key="YOUR_GODADDY_API_KEY"',
    'export GD_Secret="YOUR_GODADDY_API_SECRET"',
    "",
    "# 3. Issue wildcard certificate",
    "~/.acme.sh/acme.sh --issue --dns dns_gd \\",
    "  -d emenu-cambodia.com -d '*.emenu-cambodia.com' \\",
    "  --server letsencrypt",
    "",
    "# 4. Install certificate files",
    "mkdir -p /etc/ssl/emenu-cambodia",
    "~/.acme.sh/acme.sh --install-cert -d emenu-cambodia.com \\",
    "  --cert-file      /etc/ssl/emenu-cambodia/cert.pem \\",
    "  --key-file       /etc/ssl/emenu-cambodia/key.pem \\",
    "  --fullchain-file /etc/ssl/emenu-cambodia/fullchain.pem \\",
    '  --reloadcmd      "nginx -s reload"',
    "",
    "# 5. Check cert & renewal schedule",
    "~/.acme.sh/acme.sh --list",
    "",
    "# 6. Manual renewal (if needed)",
    "~/.acme.sh/acme.sh --renew -d emenu-cambodia.com --force",
]))
story.append(sp(8))
story.append(Paragraph("⚠  Always regenerate your GoDaddy API key after use — never commit it to git.", note_style))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 5 — Nginx Configuration
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Nginx Reverse Proxy Configuration",
                            "Three virtual hosts — owner (3000), API (7070), client wildcard (3001)"))
story.append(sp(10))

nginx_configs = [
    ("/etc/nginx/conf.d/emenu-owner.conf", "emenu-cambodia.com → :3000", [
        'server {',
        '  listen 80;',
        '  server_name emenu-cambodia.com www.emenu-cambodia.com;',
        '  return 301 https://$host$request_uri;',
        '}',
        'server {',
        '  listen 443 ssl;',
        '  server_name emenu-cambodia.com www.emenu-cambodia.com;',
        '  ssl_certificate     /etc/ssl/emenu-cambodia/fullchain.pem;',
        '  ssl_certificate_key /etc/ssl/emenu-cambodia/key.pem;',
        '  location / {',
        '    proxy_pass http://127.0.0.1:3000;',
        '    proxy_set_header Host $host;',
        '    proxy_set_header X-Real-IP $remote_addr;',
        '  }',
        '}',
    ]),
    ("/etc/nginx/conf.d/emenu-api.conf", "api.emenu-cambodia.com → :7070", [
        'server {',
        '  listen 443 ssl;',
        '  server_name api.emenu-cambodia.com;',
        '  ssl_certificate     /etc/ssl/emenu-cambodia/fullchain.pem;',
        '  ssl_certificate_key /etc/ssl/emenu-cambodia/key.pem;',
        '  client_max_body_size 50M;',
        '  location / {',
        '    proxy_pass http://127.0.0.1:7070;',
        '    proxy_set_header Host $host;',
        '    proxy_set_header X-Real-IP $remote_addr;',
        '  }',
        '}',
    ]),
    ("/etc/nginx/conf.d/emenu-client.conf", "*.emenu-cambodia.com → :3001", [
        'server {',
        '  listen 443 ssl;',
        '  server_name *.emenu-cambodia.com;',
        '  ssl_certificate     /etc/ssl/emenu-cambodia/fullchain.pem;',
        '  ssl_certificate_key /etc/ssl/emenu-cambodia/key.pem;',
        '  location / {',
        '    proxy_pass http://127.0.0.1:3001;',
        '    proxy_set_header Host $host;',
        '    proxy_set_header X-Real-IP $remote_addr;',
        '  }',
        '}',
    ]),
]

for fname, label, lines in nginx_configs:
    hdr = Table([[Paragraph(label + "   —   " + fname,
                            S("NH", fontSize=10, textColor=WHITE, fontName="Helvetica-Bold"))],],
                colWidths=[W - 3*cm])
    hdr.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),DARK),
                              ("LEFTPADDING",(0,0),(-1,-1),10),
                              ("TOPPADDING",(0,0),(-1,-1),5),
                              ("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story.append(hdr)
    story.append(code_block(lines))
    story.append(sp(6))

story.append(code_block([
    "# Test config and reload",
    "nginx -t && nginx -s reload",
]))
story.append(sp(6))
story.append(Paragraph("Note: emenu-client.conf must load AFTER emenu-owner.conf so the wildcard does not catch the exact domain.", note_style))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 6 — Backend Deployment
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Backend Deployment", "Spring Boot — build jar → copy to server → docker build & run"))
story.append(sp(10))

steps = [
    ("1. Build JAR (Docker Maven — no JDK needed on dev machine)",
     ["docker run --rm -v $(pwd):/app -w /app maven:3.9-eclipse-temurin-21-alpine mvn clean package -DskipTests",
      "# Output: menu-scanner-backend/target/e_menu_cambodia.jar"]),
    ("2. Copy JAR to server",
     ["scp menu-scanner-backend/target/e_menu_cambodia.jar \\",
      "    root@167.172.88.194:/opt/apps/emenu-backend/"]),
    ("3. Copy Dockerfile & docker-compose to server",
     ["scp menu-scanner-backend/Dockerfile \\",
      "    root@167.172.88.194:/opt/apps/emenu-backend/",
      "scp menu-scanner-backend/docker-compose.server.yml \\",
      "    root@167.172.88.194:/opt/apps/emenu-backend/docker-compose.yml"]),
    ("4. SSH in → build & start",
     ["ssh root@167.172.88.194",
      "cd /opt/apps/emenu-backend",
      "docker compose build --no-cache",
      "docker compose up -d"]),
    ("5. Verify",
     ["docker ps                          # STATUS: (healthy)",
      "curl http://localhost:7070/actuator/health"]),
]

for title, cmds in steps:
    story.append(Paragraph(title, h2_style))
    story.append(sp(3))
    story.append(code_block(cmds))
    story.append(sp(8))

story.append(Paragraph("⚠  application-prod.yaml is baked into the JAR at build time. "
                        "Rebuild the JAR whenever you change YAML config (JWT secret, Telegram token, DB password, etc.).", note_style))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 7 — Frontend Deployments
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Frontend Deployments", "Owner (port 3000) and Client (port 3001) — Next.js 14 standalone"))
story.append(sp(10))

for name, port, path in [("Owner Frontend", "3000", "owner-frontend"),
                          ("Client Frontend", "3001", "client-frontend")]:
    hdr = Table([[Paragraph(f"{name}  —  port {port}  —  /opt/apps/{path}/",
                            S("FH", fontSize=11, textColor=WHITE, fontName="Helvetica-Bold"))],],
                colWidths=[W - 3*cm])
    hdr.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),ORANGE),
                              ("LEFTPADDING",(0,0),(-1,-1),10),
                              ("TOPPADDING",(0,0),(-1,-1),6),
                              ("BOTTOMPADDING",(0,0),(-1,-1),6)]))
    story.append(hdr)
    story.append(code_block([
        f"# Dockerfile  (port {port})",
        "FROM node:20-alpine AS builder",
        "WORKDIR /app",
        "COPY . .",
        "RUN npm ci && npm run build",
        "",
        "FROM node:20-alpine",
        "WORKDIR /app",
        f"ENV PORT={port} NODE_ENV=production",
        "COPY --from=builder /app/.next/standalone .",
        "COPY --from=builder /app/.next/static ./.next/static",
        "COPY --from=builder /app/public ./public",
        'CMD ["node", "server.js"]',
        "",
        "# Build & run",
        f"cd /opt/apps/{path}",
        "docker compose build --no-cache && docker compose up -d",
    ]))
    story.append(sp(10))

story.append(Paragraph("⚠  NEXT_PUBLIC_API_BASE_URL must be set at BUILD time (not runtime) for Next.js. "
                        "It is baked into the JS bundle during npm run build.", note_style))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 8 — Database & Init Data
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Database Setup & Production Init Data"))
story.append(sp(10))

story.append(section_title("PostgreSQL Connection Details"))
story.append(sp(4))
story.append(info_table([
    ("Host",          "167.172.88.194  (or DB_HOST environment variable)"),
    ("Port",          "5432"),
    ("Database",      "e_menu_platform"),
    ("Username",      "postgres"),
    ("DDL auto",      "update  (Hibernate creates/alters tables on startup)"),
    ("pgAdmin tool",  "Connect via pgAdmin using the credentials above"),
]))
story.append(sp(12))

story.append(section_title("Production Init Data  (scripts/init-production-data.sql)"))
story.append(sp(4))
story.append(Paragraph("Run once on a fresh database after the backend starts. Safe to re-run — all inserts use WHERE NOT EXISTS.", body_style))
story.append(sp(6))

init_data = [
    [Paragraph("What", white_bold), Paragraph("Detail", white_bold)],
    [Paragraph("PLATFORM_OWNER role", body_style), Paragraph("Global role, no business_id", body_style)],
    [Paragraph("CUSTOMER role", body_style), Paragraph("Used by social auth auto-create", body_style)],
    [Paragraph("Platform owner user", body_style), Paragraph("phatmenghor19@gmail.com  /  password: 88889999", body_style)],
    [Paragraph("User profile", body_style), Paragraph("Phat Menghor  •  +855-19-000-019", body_style)],
    [Paragraph("Role assignment", body_style), Paragraph("Platform owner user → PLATFORM_OWNER role", body_style)],
    [Paragraph("Subscription plans", body_style), Paragraph("1 Week (WEEKLY) / 1 Month (MONTHLY) / 1 Year (YEARLY) — all PUBLIC, $0.00", body_style)],
]
t = Table(init_data, colWidths=[5*cm, None])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), DARK),
    ("ROWBACKGROUNDS",(0,1),(-1,-1), [LGRAY, WHITE]),
    ("GRID",          (0,0), (-1,-1), 0.5, colors.HexColor("#DDDDDD")),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
]))
story.append(t)
story.append(sp(10))
story.append(code_block([
    "-- Verify after running:",
    "SELECT name, price, status, duration_type FROM subscription_plans WHERE is_deleted = false;",
    "-- Expected: 3 rows  (1 Week, 1 Month, 1 Year)",
    "",
    "-- If pricing section on website still shows empty → flush Redis cache:",
    "docker exec -it <redis-container-id> redis-cli FLUSHDB",
]))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 9 — Location Data Migration
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Location Data Migration",
                            "Province / District / Commune / Village — source DB (bigint) → production (UUID)"))
story.append(sp(10))

story.append(Paragraph(
    "The source database uses bigint PKs. Production uses UUID (BaseUUIDEntity). "
    "Production FK links are code-based (province_code, district_code, commune_code) — no UUID mapping needed.",
    body_style))
story.append(sp(10))

steps9 = [
    ("Step 1", "Open pgAdmin → source database → Query Tool"),
    ("Step 2", "Run the 4 Part A queries from  scripts/migrate-location-data.sql  (province, district, commune, village)"),
    ("Step 3", "In Data Output panel → click ↓ Download icon → Download as CSV  (save as province.csv, etc.)"),
    ("Step 4", "Open each CSV in Notepad → Ctrl+H → find \" → replace with nothing → delete header line → Save As .sql (UTF-8)"),
    ("Step 5", "Open pgAdmin → e_menu_platform (production) → Query Tool"),
    ("Step 6", "Ctrl+O (Open File) → select province.sql → F5 to run"),
    ("Step 7", "Repeat in order:  district.sql → commune.sql → village.sql"),
    ("Step 8", "Run Part C verify query — counts must match between source and production"),
]

step_data = [[Paragraph(n, S("SN", fontSize=10, textColor=WHITE, fontName="Helvetica-Bold")),
              Paragraph(d, body_style)] for n, d in steps9]
t = Table(step_data, colWidths=[2*cm, None])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (0,-1), ORANGE),
    ("ROWBACKGROUNDS",(1,0),(1,-1), [LGRAY, WHITE]),
    ("GRID",          (0,0), (-1,-1), 0.5, colors.HexColor("#DDDDDD")),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
]))
story.append(t)
story.append(sp(10))

story.append(code_block([
    "-- Part C: Verify counts on production",
    "SELECT 'province', COUNT(*) FROM location_province_cbc WHERE is_deleted=false",
    "UNION ALL SELECT 'district', COUNT(*) FROM location_district_cbc WHERE is_deleted=false",
    "UNION ALL SELECT 'commune',  COUNT(*) FROM location_commune_cbc  WHERE is_deleted=false",
    "UNION ALL SELECT 'village',  COUNT(*) FROM location_village_cbc  WHERE is_deleted=false;",
]))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 10 — Telegram Bot
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Telegram Bot Setup",
                            "Webhook registration + Login Widget + BotFather domain config"))
story.append(sp(10))

story.append(section_title("Bot Configuration"))
story.append(sp(4))
story.append(info_table([
    ("Webhook URL",   "https://api.emenu-cambodia.com/api/v1/telegram/webhook"),
    ("Group chat ID", "-1002784141362"),
    ("Login domain",  "emenu-cambodia.com  (covers all subdomains automatically)"),
    ("auto-setup",    "true  (backend registers webhook on startup via application-prod.yaml)"),
]))
story.append(sp(12))

story.append(section_title("BotFather — Enable Login Widget"))
story.append(sp(4))
for step in ["Open Telegram → search @BotFather",
             "Send /setdomain",
             "Select your bot",
             "Enter domain:  emenu-cambodia.com",
             "BotFather replies: 'Domain updated' ✓"]:
    story.append(bullet(step))
    story.append(sp(2))

story.append(sp(10))
story.append(section_title("Set & Verify Webhook (run once after backend is live)"))
story.append(sp(4))
story.append(code_block([
    "# Set webhook",
    "curl -s 'https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook' \\",
    "  --data-urlencode 'url=https://api.emenu-cambodia.com/api/v1/telegram/webhook'",
    "",
    "# Verify webhook",
    "curl 'https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo'",
    '# Expected: "url": "https://api.emenu-cambodia.com/api/v1/telegram/webhook"',
]))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 11 — Moving to a New Server
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Moving to a New Server", "Complete checklist — follow in this order"))
story.append(sp(10))

checklist = [
    ("1. Provision Server",      ["Get a Linux VPS (Ubuntu)", "SSH in as root", "Install Docker: curl -fsSL https://get.docker.com | sh", "Install Nginx: apt-get install -y nginx", "Install acme.sh"]),
    ("2. DNS Update",            ["Log in to GoDaddy", "Update A record: emenu-cambodia.com → new server IP", "Update A record: api.emenu-cambodia.com → new server IP", "Wildcard *.emenu-cambodia.com → new server IP", "Wait for DNS propagation (~5-30 min)"]),
    ("3. SSL Certificate",       ["Generate new GoDaddy API key + secret", "Run acme.sh --issue command (see SSL Setup page)", "Install cert to /etc/ssl/emenu-cambodia/", "Verify: ls /etc/ssl/emenu-cambodia/"]),
    ("4. Nginx",                 ["Create /etc/nginx/conf.d/ config files (3 files)", "nginx -t && nginx -s reload"]),
    ("5. Database",              ["Start postgres:17 Docker container", "Connect in pgAdmin with new server IP", "Start backend — Hibernate auto-creates all tables", "Run scripts/init-production-data.sql", "Run scripts/migrate-location-data.sql (Parts A+B)"]),
    ("6. Backend",               ["Build JAR: mvn clean package -DskipTests", "scp jar + Dockerfile + docker-compose to /opt/apps/emenu-backend/", "docker compose build --no-cache && docker compose up -d", "docker ps → verify (healthy)"]),
    ("7. Frontends",             ["Copy source to /opt/apps/owner-frontend/ and /opt/apps/client-frontend/", "docker compose build --no-cache && docker compose up -d  (both)"]),
    ("8. Telegram",              ["Update webhook: curl setWebhook with new URL (if domain changed)", "Verify with getWebhookInfo"]),
    ("9. Verify All",            ["Open https://emenu-cambodia.com — owner frontend", "Open https://api.emenu-cambodia.com/actuator/health — backend", "Open https://any-subdomain.emenu-cambodia.com — client frontend"]),
]

for section, items in checklist:
    hdr = Table([[Paragraph(section, S("CH", fontSize=10, textColor=WHITE, fontName="Helvetica-Bold"))],],
                colWidths=[W - 3*cm])
    hdr.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),DARK),
                              ("LEFTPADDING",(0,0),(-1,-1),10),
                              ("TOPPADDING",(0,0),(-1,-1),4),
                              ("BOTTOMPADDING",(0,0),(-1,-1),4)]))
    rows = [[Paragraph("✓", S("CB", fontSize=9, textColor=ORANGE, fontName="Helvetica-Bold")),
             Paragraph(item, S("CI", fontSize=9, textColor=DARK, fontName="Helvetica"))]
            for item in items]
    t = Table(rows, colWidths=[0.5*cm, None])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[LGRAY, WHITE]),
        ("GRID",(0,0),(-1,-1),0.3,colors.HexColor("#EEEEEE")),
        ("LEFTPADDING",(0,0),(-1,-1),5),
        ("TOPPADDING",(0,0),(-1,-1),3),
        ("BOTTOMPADDING",(0,0),(-1,-1),3),
    ]))
    story.append(KeepTogether([hdr, t, sp(6)]))

story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 12 — Quick Reference Commands
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Quick Reference Commands", "Day-to-day server operations"))
story.append(sp(10))

story.append(code_block([
    "# ── View all running containers ────────────────────────────────────────",
    "docker ps",
    "",
    "# ── Restart a service ───────────────────────────────────────────────────",
    "docker restart emenu_backend",
    "",
    "# ── View live logs ──────────────────────────────────────────────────────",
    "docker logs -f emenu_backend",
    "docker logs -f --tail 100 emenu_backend",
    "",
    "# ── Rebuild backend after new JAR ───────────────────────────────────────",
    "cd /opt/apps/emenu-backend",
    "docker compose build --no-cache && docker compose up -d",
    "",
    "# ── Rebuild a frontend after code change ────────────────────────────────",
    "cd /opt/apps/owner-frontend   # or client-frontend",
    "docker compose build --no-cache && docker compose up -d",
    "",
    "# ── Flush Redis cache (needed after direct SQL inserts) ─────────────────",
    "docker exec -it <redis-container-id> redis-cli FLUSHDB",
    "",
    "# ── Check SSL cert expiry & renewal schedule ────────────────────────────",
    "~/.acme.sh/acme.sh --list",
    "",
    "# ── Force SSL renewal ───────────────────────────────────────────────────",
    "~/.acme.sh/acme.sh --renew -d emenu-cambodia.com --force",
    "",
    "# ── Test and reload Nginx ───────────────────────────────────────────────",
    "nginx -t && nginx -s reload",
    "",
    "# ── Set Telegram webhook ────────────────────────────────────────────────",
    "curl -s 'https://api.telegram.org/bot<TOKEN>/setWebhook' \\",
    "  --data-urlencode 'url=https://api.emenu-cambodia.com/api/v1/telegram/webhook'",
]))
story.append(PageBreak())


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 13 — Setup Complete / Status
# ═══════════════════════════════════════════════════════════════════════════════
story.append(orange_header("Setup Complete — Service Status Checklist"))
story.append(sp(10))

done = [
    ("PostgreSQL 17",        "Running on :5432  •  Database: e_menu_platform",                        GREEN),
    ("Redis 7",              "Running on :6379  •  Cache TTL: 6 hours for subscription plans",        GREEN),
    ("Spring Boot Backend",  "Running on :7070  •  Status: healthy  •  Telegram webhook active",      GREEN),
    ("Owner Frontend",       "Running on :3000  •  https://emenu-cambodia.com",                       GREEN),
    ("Client Frontend",      "Running on :3001  •  https://*.emenu-cambodia.com",                     GREEN),
    ("Nginx",                "Routing all 3 domains  •  SSL termination active",                      GREEN),
    ("Wildcard SSL",         "*.emenu-cambodia.com  •  Auto-renew via acme.sh cron",                  GREEN),
    ("Telegram Bot",         "Webhook registered  •  Login domain: emenu-cambodia.com",               GREEN),
    ("Init Data",            "Platform owner user + 3 subscription plans inserted",                   GREEN),
    ("Location Data",        "Province / District / Commune / Village migrated from source DB",       GREEN),
]

done_data = [
    [Paragraph("✓", S("DI", fontSize=14, textColor=WHITE, fontName="Helvetica-Bold", alignment=TA_CENTER)),
     Paragraph(service, S("DS", fontSize=11, textColor=DARK, fontName="Helvetica-Bold")),
     Paragraph(status, S("DD", fontSize=10, textColor=MGRAY, fontName="Helvetica"))]
    for service, status, color in done
]

t = Table(done_data, colWidths=[1*cm, 5.5*cm, None])
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (0,-1), GREEN),
    ("ROWBACKGROUNDS",(1,0),(-1,-1), [LGRAY, WHITE]),
    ("GRID",          (0,0), (-1,-1), 0.5, colors.HexColor("#DDDDDD")),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("TOPPADDING",    (0,0), (-1,-1), 8),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
]))
story.append(t)
story.append(sp(16))
story.append(Paragraph("emenu-cambodia.com", orange_center))
story.append(Paragraph("All systems operational", center_style))


# ── Build PDF ─────────────────────────────────────────────────────────────────
doc.build(story)
print(f"Saved → {OUTPUT}")
