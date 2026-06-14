"""
Generate eMenu Cambodia Server Setup Guide as PowerPoint.
Run: python3 generate-server-setup-pptx.py
Output: eMenu_Cambodia_Server_Setup_Guide.pptx
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import pptx.oxml.ns as nsmap
from lxml import etree

# ── Brand colours ─────────────────────────────────────────────────────────────
ORANGE      = RGBColor(0xE8, 0x6B, 0x00)   # eMenu orange
DARK        = RGBColor(0x1E, 0x1E, 0x2E)   # near-black
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY  = RGBColor(0xF5, 0xF5, 0xF5)
MID_GRAY    = RGBColor(0x64, 0x64, 0x78)
GREEN       = RGBColor(0x22, 0xC5, 0x5E)
BLUE        = RGBColor(0x38, 0x8B, 0xFD)
RED         = RGBColor(0xEF, 0x44, 0x44)

SLIDE_W = Inches(13.33)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H

BLANK = prs.slide_layouts[6]   # completely blank


# ── Helpers ───────────────────────────────────────────────────────────────────
def add_rect(slide, l, t, w, h, fill=None, line=None):
    shape = slide.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    shape.line.fill.background()
    if fill:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    else:
        shape.fill.background()
    if line:
        shape.line.color.rgb = line
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape


def add_text(slide, text, l, t, w, h,
             size=14, bold=False, color=DARK, align=PP_ALIGN.LEFT,
             wrap=True, italic=False):
    txBox = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = txBox.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    return txBox


def add_bullet_box(slide, items, l, t, w, h, size=11, color=DARK, indent=False):
    txBox = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = txBox.text_frame
    tf.word_wrap = True
    first = True
    for item in items:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = PP_ALIGN.LEFT
        run = p.add_run()
        prefix = "    • " if indent else "• "
        run.text = prefix + item
        run.font.size = Pt(size)
        run.font.color.rgb = color


def slide_header(slide, title, subtitle=None):
    # top orange bar
    add_rect(slide, 0, 0, 13.33, 1.1, fill=ORANGE)
    add_text(slide, title, 0.4, 0.1, 12.5, 0.7,
             size=28, bold=True, color=WHITE)
    if subtitle:
        add_text(slide, subtitle, 0.4, 0.72, 12.5, 0.35,
                 size=13, color=RGBColor(0xFF, 0xDD, 0xAA))
    # bottom accent line
    add_rect(slide, 0, 7.3, 13.33, 0.2, fill=ORANGE)


def numbered_step(slide, num, title, desc_lines, top):
    """Draw a numbered step block."""
    # circle
    circ = slide.shapes.add_shape(9, Inches(0.3), Inches(top), Inches(0.5), Inches(0.5))
    circ.fill.solid()
    circ.fill.fore_color.rgb = ORANGE
    circ.line.fill.background()
    tf = circ.text_frame
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    r = tf.paragraphs[0].add_run()
    r.text = str(num)
    r.font.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = WHITE

    add_text(slide, title, 0.95, top - 0.02, 11.8, 0.3,
             size=12, bold=True, color=DARK)
    y = top + 0.28
    for line in desc_lines:
        add_text(slide, line, 1.1, y, 11.6, 0.25, size=10, color=MID_GRAY)
        y += 0.23
    return y + 0.05


def code_box(slide, code_lines, l, t, w, h):
    bg = add_rect(slide, l, t, w, h, fill=DARK)
    txBox = slide.shapes.add_textbox(
        Inches(l + 0.15), Inches(t + 0.1),
        Inches(w - 0.3), Inches(h - 0.2))
    tf = txBox.text_frame
    tf.word_wrap = False
    first = True
    for line in code_lines:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        run = p.add_run()
        run.text = line
        run.font.size = Pt(9)
        run.font.color.rgb = GREEN
        run.font.name = "Courier New"


def tag_box(slide, label, value, l, t, tag_color=ORANGE):
    add_rect(slide, l, t, 1.6, 0.32, fill=tag_color)
    add_text(slide, label, l + 0.05, t + 0.04, 1.5, 0.25,
             size=9, bold=True, color=WHITE)
    add_rect(slide, l + 1.6, t, 3.6, 0.32, fill=LIGHT_GRAY, line=RGBColor(0xDD, 0xDD, 0xDD))
    add_text(slide, value, l + 1.7, t + 0.04, 3.4, 0.25,
             size=9, color=DARK)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — Title
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_rect(s, 0, 0, 13.33, 7.5, fill=DARK)
add_rect(s, 0, 0, 13.33, 0.18, fill=ORANGE)
add_rect(s, 0, 7.32, 13.33, 0.18, fill=ORANGE)
add_rect(s, 0.3, 2.5, 0.12, 2.5, fill=ORANGE)
add_text(s, "eMenu Cambodia", 0.7, 2.2, 12, 0.9,
         size=44, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
add_text(s, "Server Setup Guide", 0.7, 3.05, 12, 0.7,
         size=36, bold=False, color=ORANGE, align=PP_ALIGN.LEFT)
add_text(s, "Complete step-by-step deployment & configuration reference",
         0.7, 3.8, 11, 0.4, size=15, color=RGBColor(0xAA, 0xAA, 0xBB),
         align=PP_ALIGN.LEFT)
add_text(s, "Domain: emenu-cambodia.com  •  Server IP: 167.172.88.194  •  OS: Ubuntu Linux",
         0.7, 4.3, 12, 0.35, size=12, color=RGBColor(0x88, 0x88, 0x99),
         align=PP_ALIGN.LEFT)
add_text(s, "Last Updated: June 2026", 0.7, 6.9, 6, 0.3,
         size=10, color=RGBColor(0x66, 0x66, 0x77), align=PP_ALIGN.LEFT)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — Architecture Overview
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Architecture Overview", "All services run in Docker on a single Linux VPS")

# Internet box
add_rect(s, 0.3, 1.3, 2.0, 0.7, fill=BLUE)
add_text(s, "Internet / Users", 0.3, 1.38, 2.0, 0.55, size=11, bold=True,
         color=WHITE, align=PP_ALIGN.CENTER)

# Nginx box
add_rect(s, 3.0, 1.3, 2.5, 0.7, fill=ORANGE)
add_text(s, "Nginx\nReverse Proxy", 3.0, 1.3, 2.5, 0.7, size=11, bold=True,
         color=WHITE, align=PP_ALIGN.CENTER)

# Arrow
add_text(s, "──────▶", 2.3, 1.52, 0.8, 0.3, size=12, color=MID_GRAY)

# Services
services = [
    ("Owner Frontend", "port 3000", "emenu-cambodia.com", DARK),
    ("Client Frontend", "port 3001", "*.emenu-cambodia.com", DARK),
    ("Backend API",    "port 7070", "api.emenu-cambodia.com", DARK),
    ("PostgreSQL",     "port 5432", "Internal only", MID_GRAY),
    ("Redis",          "port 6379", "Internal only", MID_GRAY),
]
for i, (name, port, domain, col) in enumerate(services):
    top = 1.25 + i * 1.1
    add_rect(s, 6.5, top, 3.2, 0.75, fill=col)
    add_text(s, name, 6.55, top + 0.04, 3.1, 0.3, size=11, bold=True, color=WHITE)
    add_text(s, port, 6.55, top + 0.32, 1.4, 0.25, size=9, color=RGBColor(0xAA,0xDD,0xFF))
    add_text(s, domain, 8.05, top + 0.32, 1.7, 0.25, size=9, color=ORANGE)
    # arrow from Nginx
    add_text(s, "▶", 5.8, top + 0.2, 0.5, 0.3, size=12, color=MID_GRAY)

# SSL badge
add_rect(s, 3.0, 2.3, 2.5, 0.35, fill=GREEN)
add_text(s, "Wildcard SSL  *.emenu-cambodia.com", 3.05, 2.35, 2.4, 0.28,
         size=9, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

add_text(s, "acme.sh + GoDaddy DNS API → auto-renew every ~60 days",
         0.3, 6.9, 12.7, 0.35, size=10, color=MID_GRAY, align=PP_ALIGN.CENTER)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — Server Info & Prerequisites
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Server Information & Prerequisites")

info = [
    ("VPS Provider",  "DigitalOcean / any Linux VPS"),
    ("Server IP",     "167.172.88.194"),
    ("OS",            "Ubuntu Linux"),
    ("Domain",        "emenu-cambodia.com  (GoDaddy DNS)"),
    ("Nameservers",   "ns47.domaincontrol.com / ns48.domaincontrol.com"),
    ("Access",        "SSH as root"),
]
for i, (k, v) in enumerate(info):
    tag_box(s, k, v, 0.4, 1.3 + i * 0.45)

add_text(s, "Software to install on server:", 6.5, 1.2, 6.5, 0.35,
         size=12, bold=True, color=DARK)
prereqs = [
    "Docker + Docker Compose",
    "Nginx",
    "acme.sh  (SSL automation)",
    "curl, git, wget",
    "Python 3 (optional, for scripts)",
]
add_bullet_box(s, prereqs, 6.5, 1.55, 6.5, 2.0, size=11)

code_box(s, [
    "# Install Docker",
    "curl -fsSL https://get.docker.com | sh",
    "",
    "# Install Nginx",
    "apt-get install -y nginx",
    "",
    "# Install acme.sh",
    'curl https://get.acme.sh | sh -s email=phatmenghor19@gmail.com',
], 0.4, 4.0, 12.5, 2.6)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — Directory Structure
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Server Directory Structure", "Where everything lives on the server")

code_box(s, [
    "/opt/apps/",
    "├── emenu-backend/",
    "│   ├── e_menu_cambodia.jar      ← Spring Boot fat-jar (built from source)",
    "│   ├── Dockerfile               ← Multi-stage Docker build",
    "│   └── docker-compose.yml       ← Backend service definition",
    "│",
    "├── owner-frontend/",
    "│   ├── Dockerfile               ← Next.js standalone build",
    "│   └── docker-compose.yml",
    "│",
    "└── client-frontend/",
    "    ├── Dockerfile               ← Next.js standalone build",
    "    └── docker-compose.yml",
    "",
    "/etc/nginx/conf.d/",
    "├── emenu-owner.conf             ← emenu-cambodia.com  → :3000",
    "├── emenu-api.conf               ← api.emenu-cambodia.com → :7070",
    "└── emenu-client.conf            ← *.emenu-cambodia.com  → :3001",
    "",
    "/etc/ssl/emenu-cambodia/         ← SSL certificates (acme.sh)",
    "├── fullchain.pem",
    "└── key.pem",
], 0.4, 1.25, 12.5, 5.7)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — SSL Certificate Setup
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "SSL Certificate Setup", "Wildcard cert via acme.sh + GoDaddy DNS API")

add_text(s, "SSL Certificate Details", 0.4, 1.2, 6.0, 0.35,
         size=13, bold=True, color=DARK)

details = [
    ("Tool",       "acme.sh (Let's Encrypt)"),
    ("Type",       "Wildcard  *.emenu-cambodia.com"),
    ("DNS Provider","GoDaddy (API key + secret)"),
    ("Cert path",  "/etc/ssl/emenu-cambodia/fullchain.pem"),
    ("Key path",   "/etc/ssl/emenu-cambodia/key.pem"),
    ("Auto-renew", "cron job (daily 11:44) — renews ~every 60 days"),
]
for i, (k, v) in enumerate(details):
    tag_box(s, k, v, 0.4, 1.6 + i * 0.42)

code_box(s, [
    "# 1. Set GoDaddy API credentials",
    'export GD_Key="YOUR_GODADDY_API_KEY"',
    'export GD_Secret="YOUR_GODADDY_API_SECRET"',
    "",
    "# 2. Issue wildcard certificate",
    "~/.acme.sh/acme.sh --issue --dns dns_gd \\",
    "  -d emenu-cambodia.com -d '*.emenu-cambodia.com' \\",
    "  --server letsencrypt",
    "",
    "# 3. Install certificate to /etc/ssl/emenu-cambodia/",
    "mkdir -p /etc/ssl/emenu-cambodia",
    "~/.acme.sh/acme.sh --install-cert -d emenu-cambodia.com \\",
    '  --cert-file   /etc/ssl/emenu-cambodia/cert.pem \\',
    '  --key-file    /etc/ssl/emenu-cambodia/key.pem \\',
    '  --fullchain-file /etc/ssl/emenu-cambodia/fullchain.pem \\',
    '  --reloadcmd  "nginx -s reload"',
], 6.8, 1.2, 6.2, 5.6)

add_text(s, "⚠  Regenerate GoDaddy API key after each use — never commit to git",
         0.4, 6.9, 12.5, 0.35, size=10, color=RED, italic=True)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — Nginx Configuration
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Nginx Reverse Proxy Configuration",
             "Three virtual hosts — owner, API, client (wildcard)")

configs = [
    ("/etc/nginx/conf.d/emenu-owner.conf", "emenu-cambodia.com", "3000", [
        "server {",
        "  listen 443 ssl;",
        "  server_name emenu-cambodia.com www.emenu-cambodia.com;",
        "  ssl_certificate     /etc/ssl/emenu-cambodia/fullchain.pem;",
        "  ssl_certificate_key /etc/ssl/emenu-cambodia/key.pem;",
        "  location / { proxy_pass http://127.0.0.1:3000; }",
        "}",
    ]),
    ("/etc/nginx/conf.d/emenu-api.conf", "api.emenu-cambodia.com", "7070", [
        "server {",
        "  listen 443 ssl;",
        "  server_name api.emenu-cambodia.com;",
        "  ssl_certificate     /etc/ssl/emenu-cambodia/fullchain.pem;",
        "  ssl_certificate_key /etc/ssl/emenu-cambodia/key.pem;",
        "  client_max_body_size 50M;",
        "  location / { proxy_pass http://127.0.0.1:7070; }",
        "}",
    ]),
    ("/etc/nginx/conf.d/emenu-client.conf", "*.emenu-cambodia.com", "3001", [
        "server {",
        "  listen 443 ssl;",
        "  server_name *.emenu-cambodia.com;",
        "  ssl_certificate     /etc/ssl/emenu-cambodia/fullchain.pem;",
        "  ssl_certificate_key /etc/ssl/emenu-cambodia/key.pem;",
        "  location / { proxy_pass http://127.0.0.1:3001; }",
        "}",
    ]),
]

for i, (fname, domain, port, lines) in enumerate(configs):
    left = 0.3 + i * 4.35
    add_rect(s, left, 1.2, 4.1, 0.4, fill=ORANGE)
    add_text(s, domain + "  →  :" + port, left + 0.1, 1.25, 3.9, 0.32,
             size=10, bold=True, color=WHITE)
    add_text(s, fname, left + 0.1, 1.65, 3.9, 0.25,
             size=8, color=MID_GRAY, italic=True)
    code_box(s, lines, left, 1.9, 4.1, 2.0)

code_box(s, [
    "# Test and reload Nginx",
    "nginx -t && nginx -s reload",
    "",
    "# Enable HTTP→HTTPS redirect (add to each server block or separate :80 block)",
    "# server { listen 80; server_name ...; return 301 https://$host$request_uri; }",
], 0.3, 4.15, 12.7, 1.8)

add_text(s, "Important: Nginx must load emenu-client.conf AFTER emenu-owner.conf so the wildcard doesn't catch the exact domain.",
         0.3, 6.2, 12.7, 0.4, size=10, color=RED, italic=True)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — Docker Services
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Docker Services", "docker ps — all 5 containers running on the server")

headers = ["Container", "Image", "Port", "Purpose"]
col_w   = [3.0, 3.5, 1.5, 4.5]
col_l   = [0.3, 3.3, 6.8, 8.3]
header_top = 1.25

for i, (h, l, w) in enumerate(zip(headers, col_l, col_w)):
    add_rect(s, l, header_top, w, 0.38, fill=DARK)
    add_text(s, h, l + 0.08, header_top + 0.07, w - 0.1, 0.28,
             size=10, bold=True, color=WHITE)

rows = [
    ("emenu_backend",          "emenu-cambodia/backend:1.0.0",  "7070",  "Spring Boot REST API"),
    ("owner-frontend-...",     "owner-frontend-owner-frontend", "3000",  "Next.js Owner Dashboard"),
    ("client-frontend-...",    "client-frontend-client-frontend","3001", "Next.js Customer App"),
    ("redis:7-alpine",         "redis:7-alpine",                "6379",  "Cache (6 h TTL on plans)"),
    ("postgres:17",            "postgres:17",                   "5432",  "Primary database"),
]
fills = [LIGHT_GRAY, WHITE, LIGHT_GRAY, WHITE, LIGHT_GRAY]
for r, (row, fill) in enumerate(zip(rows, fills)):
    top = header_top + 0.38 + r * 0.55
    for ci, (val, l, w) in enumerate(zip(row, col_l, col_w)):
        add_rect(s, l, top, w, 0.5, fill=fill, line=RGBColor(0xDD,0xDD,0xDD))
        color = ORANGE if ci == 0 else (GREEN if ci == 2 else DARK)
        add_text(s, val, l + 0.08, top + 0.1, w - 0.1, 0.32, size=9, color=color, bold=(ci==0))

code_box(s, [
    "# View all running containers",
    "docker ps",
    "",
    "# Restart backend (e.g. after config change)",
    "docker restart emenu_backend",
    "",
    "# View backend logs",
    "docker logs -f emenu_backend",
], 0.3, 5.15, 12.7, 2.0)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 8 — Backend Deployment
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Backend Deployment", "Spring Boot — build jar → copy to server → docker build")

y = numbered_step(s, 1, "Build JAR (using Docker Maven — no JDK needed on server)", [
    "docker run --rm -v $(pwd):/app -w /app maven:3.9-eclipse-temurin-21-alpine mvn clean package -DskipTests",
    "Output: menu-scanner-backend/target/e_menu_cambodia.jar",
], 1.3)

y = numbered_step(s, 2, "Copy JAR to server", [
    "scp menu-scanner-backend/target/e_menu_cambodia.jar  root@167.172.88.194:/opt/apps/emenu-backend/",
], y)

y = numbered_step(s, 3, "Copy Dockerfile & docker-compose.server.yml to server", [
    "scp menu-scanner-backend/Dockerfile  root@167.172.88.194:/opt/apps/emenu-backend/",
    "scp menu-scanner-backend/docker-compose.server.yml  root@167.172.88.194:/opt/apps/emenu-backend/docker-compose.yml",
], y)

y = numbered_step(s, 4, "SSH into server → build & start", [
    "ssh root@167.172.88.194",
    "cd /opt/apps/emenu-backend",
    "docker compose build --no-cache && docker compose up -d",
], y)

y = numbered_step(s, 5, "Verify health", [
    "docker ps   # STATUS should show (healthy)",
    "curl http://localhost:7070/actuator/health",
], y)

add_text(s, "application-prod.yaml is baked into the JAR — rebuild jar whenever YAML config changes.",
         0.3, 7.1, 12.7, 0.3, size=10, color=RED, italic=True)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 9 — Frontend Deployments
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Frontend Deployments", "Owner (port 3000) and Client (port 3001) — Next.js standalone")

# Left column — owner
add_rect(s, 0.3, 1.25, 6.0, 0.4, fill=DARK)
add_text(s, "Owner Frontend  (emenu-cambodia.com)", 0.4, 1.3, 5.8, 0.32,
         size=11, bold=True, color=ORANGE)

code_box(s, [
    "# /opt/apps/owner-frontend/Dockerfile",
    "FROM node:20-alpine AS builder",
    "WORKDIR /app",
    "COPY . .",
    "RUN npm ci && npm run build",
    "",
    "FROM node:20-alpine",
    "WORKDIR /app",
    "ENV PORT=3000 NODE_ENV=production",
    "COPY --from=builder /app/.next/standalone .",
    "COPY --from=builder /app/.next/static ./.next/static",
    "COPY --from=builder /app/public ./public",
    'CMD ["node", "server.js"]',
], 0.3, 1.7, 6.0, 3.2)

code_box(s, [
    "# Build & run",
    "cd /opt/apps/owner-frontend",
    "docker compose build --no-cache",
    "docker compose up -d",
], 0.3, 5.0, 6.0, 1.3)

# Right column — client
add_rect(s, 6.9, 1.25, 6.1, 0.4, fill=DARK)
add_text(s, "Client Frontend  (*.emenu-cambodia.com)", 7.0, 1.3, 5.9, 0.32,
         size=11, bold=True, color=ORANGE)

code_box(s, [
    "# /opt/apps/client-frontend/Dockerfile",
    "FROM node:20-alpine AS builder",
    "WORKDIR /app",
    "COPY . .",
    "RUN npm ci && npm run build",
    "",
    "FROM node:20-alpine",
    "WORKDIR /app",
    "ENV PORT=3001 NODE_ENV=production",
    "COPY --from=builder /app/.next/standalone .",
    "COPY --from=builder /app/.next/static ./.next/static",
    "COPY --from=builder /app/public ./public",
    'CMD ["node", "server.js"]',
], 6.9, 1.7, 6.1, 3.2)

code_box(s, [
    "# Build & run",
    "cd /opt/apps/client-frontend",
    "docker compose build --no-cache",
    "docker compose up -d",
], 6.9, 5.0, 6.1, 1.3)

add_text(s,
         "NEXT_PUBLIC_API_BASE_URL must be baked in at build time (not runtime env var) for Next.js.",
         0.3, 6.5, 12.7, 0.35, size=10, color=RED, italic=True)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 10 — Database Setup
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Database Setup", "PostgreSQL 17 in Docker + production init data")

add_text(s, "Connection Details", 0.4, 1.25, 5.5, 0.35, size=13, bold=True, color=DARK)
db_info = [
    ("Host",      "167.172.88.194  (or DB_HOST env)"),
    ("Port",      "5432"),
    ("Database",  "e_menu_platform"),
    ("Username",  "postgres"),
    ("Password",  "stored in application-prod.yaml"),
    ("DDL auto",  "update  (Hibernate creates/alters tables)"),
]
for i, (k, v) in enumerate(db_info):
    tag_box(s, k, v, 0.4, 1.65 + i * 0.42)

add_text(s, "Init Production Data  (scripts/init-production-data.sql)",
         6.8, 1.25, 6.1, 0.35, size=13, bold=True, color=DARK)
init_items = [
    "PLATFORM_OWNER role  (global, no business)",
    "CUSTOMER role  (for social auth auto-create)",
    "Platform owner user: phatmenghor19@gmail.com",
    "User profile  (Phat Menghor)",
    "Role assignment",
    "3 subscription plans: 1 Week / 1 Month / 1 Year",
]
add_bullet_box(s, init_items, 6.8, 1.65, 6.1, 2.2, size=10)

code_box(s, [
    "-- Run in pgAdmin on e_menu_platform database",
    "-- File: menu-scanner-backend/scripts/init-production-data.sql",
    "",
    "-- Safe to re-run — all inserts use WHERE NOT EXISTS",
    "",
    "-- Verify after running:",
    "SELECT name, price, status, duration_type",
    "FROM subscription_plans WHERE is_deleted = false;",
    "-- Should return 3 rows: 1 Week, 1 Month, 1 Year",
], 0.4, 4.5, 12.5, 2.4)

add_text(s, "Redis cache TTL on subscription plans = 6 hours. Run FLUSHDB after inserting data directly via SQL.",
         0.4, 7.05, 12.5, 0.35, size=10, color=RED, italic=True)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 11 — Location Data Migration
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Location Data Migration",
             "Province / District / Commune / Village — source DB (bigint) → production (UUID)")

add_text(s, "The source database uses bigint PKs; production uses UUID (BaseUUIDEntity).\nFKs in production are code-based (province_code, district_code, commune_code) — no UUID mapping needed.",
         0.4, 1.2, 12.5, 0.65, size=11, color=MID_GRAY, italic=True)

steps = [
    ("pgAdmin → source DB", "Run Part A queries from scripts/migrate-location-data.sql (4 queries)"),
    ("Download each result", "Click ↓ icon in Data Output → Download as CSV (province / district / commune / village)"),
    ("Convert CSV → SQL",   "Notepad: Ctrl+H → remove all \" → delete header line → Save As .sql (UTF-8)"),
    ("pgAdmin → production DB", "Open each .sql via Ctrl+O folder icon → F5 to run IN ORDER:"),
    ("Order matters",       "1. province.sql  2. district.sql  3. commune.sql  4. village.sql"),
    ("Verify counts",       "Run Part C verify query — counts must match between source and production"),
]
y = 1.95
for num, (title, desc) in enumerate(steps, 1):
    y = numbered_step(s, num, title, [desc], y)

code_box(s, [
    "-- Part C: Verify on production",
    "SELECT 'province', COUNT(*) FROM location_province_cbc WHERE is_deleted=false",
    "UNION ALL SELECT 'district', COUNT(*) FROM location_district_cbc WHERE is_deleted=false",
    "UNION ALL SELECT 'commune',  COUNT(*) FROM location_commune_cbc  WHERE is_deleted=false",
    "UNION ALL SELECT 'village',  COUNT(*) FROM location_village_cbc  WHERE is_deleted=false;",
], 0.4, 6.3, 12.5, 1.0)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 12 — Telegram Bot Setup
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Telegram Bot Setup", "Webhook + Login Widget + BotFather domain config")

add_text(s, "Bot Configuration", 0.4, 1.25, 5.8, 0.35, size=13, bold=True, color=DARK)
bot_info = [
    ("Bot token",    "stored in application-prod.yaml / docker-compose env"),
    ("Webhook URL",  "https://api.emenu-cambodia.com/api/v1/telegram/webhook"),
    ("Group chat ID","-1002784141362"),
    ("Login domain", "emenu-cambodia.com  (covers all subdomains)"),
]
for i, (k, v) in enumerate(bot_info):
    tag_box(s, k, v, 0.4, 1.65 + i * 0.45)

add_text(s, "Setup Steps", 6.8, 1.25, 6.1, 0.35, size=13, bold=True, color=DARK)
steps2 = [
    "Open Telegram → @BotFather",
    "/setdomain → select your bot → enter: emenu-cambodia.com",
    "BotFather replies: 'Domain updated'",
    "Set webhook via API (one-time after deploy):",
]
add_bullet_box(s, steps2, 6.8, 1.65, 6.1, 1.5, size=10)

code_box(s, [
    "# Set Telegram webhook (run once after backend is live)",
    "curl -s 'https://api.telegram.org/bot<TOKEN>/setWebhook' \\",
    "  --data-urlencode 'url=https://api.emenu-cambodia.com/api/v1/telegram/webhook'",
    "",
    "# Verify webhook",
    "curl 'https://api.telegram.org/bot<TOKEN>/getWebhookInfo'",
    "# Should show: url: https://api.emenu-cambodia.com/...",
], 0.4, 3.6, 12.5, 2.0)

code_box(s, [
    "# application-prod.yaml key settings",
    "telegram:",
    "  bot:",
    "    token: '${TELEGRAM_BOT_TOKEN}'",
    "    webhook-url: '${TELEGRAM_WEBHOOK_URL:https://api.emenu-cambodia.com}'",
    "    auto-setup: true",
], 0.4, 5.7, 12.5, 1.5)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 13 — Moving to a New Server
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Moving to a New Server", "Checklist for re-deployment on a fresh VPS")

checklist = [
    ("Infrastructure",  [
        "Provision Linux VPS (Ubuntu recommended)",
        "Point DNS A records to new server IP (GoDaddy panel)",
        "Install Docker, Nginx, acme.sh on new server",
    ]),
    ("SSL",  [
        "Generate new GoDaddy API key+secret",
        "Run acme.sh issue command (same as Slide 5)",
        "Install cert to /etc/ssl/emenu-cambodia/",
    ]),
    ("Nginx",  [
        "Copy 3 conf files from /etc/nginx/conf.d/",
        "nginx -t && nginx -s reload",
    ]),
    ("Database",  [
        "Start postgres:17 Docker container",
        "Start Spring Boot backend (Hibernate auto-creates tables)",
        "Run init-production-data.sql in pgAdmin",
        "Run migrate-location-data.sql (Parts A + B)",
    ]),
    ("Backend",  [
        "Build jar: mvn clean package -DskipTests",
        "Copy jar + Dockerfile + docker-compose to /opt/apps/emenu-backend/",
        "docker compose build && docker compose up -d",
    ]),
    ("Frontends",  [
        "Copy source to /opt/apps/owner-frontend/ and /opt/apps/client-frontend/",
        "docker compose build --no-cache && docker compose up -d  (both)",
    ]),
    ("Telegram",  [
        "Update webhook URL if domain/IP changes",
        "curl setWebhook with new URL",
    ]),
]

col = 0
row = 0
for section, items in checklist:
    left  = 0.3  + col * 6.55
    top   = 1.25 + row * 2.85
    add_rect(s, left, top, 6.2, 0.38, fill=ORANGE)
    add_text(s, "✓ " + section, left + 0.1, top + 0.06, 6.0, 0.3,
             size=11, bold=True, color=WHITE)
    add_bullet_box(s, items, left + 0.1, top + 0.42, 6.0, len(items) * 0.33 + 0.1,
                   size=10, color=DARK)
    row += 1
    if row == 4:
        row = 0
        col = 1


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 14 — Quick Reference Commands
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
slide_header(s, "Quick Reference Commands", "Day-to-day operations on the server")

code_box(s, [
    "# ── View all containers ────────────────────────────────",
    "docker ps",
    "",
    "# ── Restart a service ──────────────────────────────────",
    "docker restart emenu_backend",
    "docker restart <owner-container-name>",
    "docker restart <client-container-name>",
    "",
    "# ── View logs ───────────────────────────────────────────",
    "docker logs -f emenu_backend",
    "docker logs -f --tail 100 emenu_backend",
    "",
    "# ── Flush Redis cache ───────────────────────────────────",
    "docker exec -it <redis-container-id> redis-cli FLUSHDB",
    "",
    "# ── Rebuild backend after jar update ────────────────────",
    "cd /opt/apps/emenu-backend",
    "docker compose build --no-cache && docker compose up -d",
    "",
    "# ── Check SSL cert expiry ────────────────────────────────",
    "~/.acme.sh/acme.sh --list",
    "",
    "# ── Renew SSL manually ───────────────────────────────────",
    '~/.acme.sh/acme.sh --renew -d emenu-cambodia.com --force',
    "",
    "# ── Reload Nginx ─────────────────────────────────────────",
    "nginx -t && nginx -s reload",
], 0.3, 1.2, 12.7, 5.95)


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 15 — Summary / Done Checklist
# ══════════════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_rect(s, 0, 0, 13.33, 7.5, fill=DARK)
add_rect(s, 0, 0, 13.33, 0.18, fill=ORANGE)
add_rect(s, 0, 7.32, 13.33, 0.18, fill=ORANGE)
add_text(s, "Setup Complete — Service Status",
         0.5, 0.35, 12.3, 0.7, size=28, bold=True, color=WHITE)

done = [
    ("PostgreSQL 17",        "Running on :5432  •  DB: e_menu_platform"),
    ("Redis 7",              "Running on :6379  •  cache TTL: 6 hours"),
    ("Spring Boot Backend",  "Running on :7070  •  healthy  •  webhook active"),
    ("Owner Frontend",       "Running on :3000  •  emenu-cambodia.com"),
    ("Client Frontend",      "Running on :3001  •  *.emenu-cambodia.com"),
    ("Nginx",                "Routing all 3 domains  •  SSL active"),
    ("Wildcard SSL",         "*.emenu-cambodia.com  •  auto-renew via acme.sh"),
    ("Telegram Bot",         "Webhook set  •  Login domain: emenu-cambodia.com"),
    ("Init Data",            "Platform owner user + 3 subscription plans inserted"),
    ("Location Data",        "Province / District / Commune / Village migrated"),
]

for i, (service, status) in enumerate(done):
    top = 1.1 + i * 0.59
    add_rect(s, 0.4, top, 0.42, 0.38, fill=GREEN)
    add_text(s, "✓", 0.4, top + 0.04, 0.42, 0.3,
             size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(s, service, 0.95, top + 0.05, 3.2, 0.28,
             size=11, bold=True, color=WHITE)
    add_text(s, status, 4.2, top + 0.05, 8.9, 0.28,
             size=10, color=RGBColor(0xAA, 0xCC, 0xFF))

add_text(s, "emenu-cambodia.com", 0.5, 7.0, 12.3, 0.35,
         size=13, bold=True, color=ORANGE, align=PP_ALIGN.CENTER)


# ── Save ──────────────────────────────────────────────────────────────────────
OUTPUT = "/home/user/khmer_project/eMenu_Cambodia_Server_Setup_Guide.pptx"
prs.save(OUTPUT)
print(f"Saved → {OUTPUT}")
