#!/bin/bash
# ============================================================
# setup-ssl.sh — Run ONCE on the production server
#
# Prerequisites:
#   1. GoDaddy DNS: A record  *  → YOUR_SERVER_IP
#                  A record  @  → YOUR_SERVER_IP
#   2. Nginx installed:  sudo apt install nginx
#   3. Certbot installed: sudo apt install certbot python3-certbot-nginx
#
# Usage:
#   chmod +x setup-ssl.sh
#   sudo ./setup-ssl.sh
# ============================================================

DOMAIN="emenu-cambodia.com"

echo "==> Installing wildcard SSL certificate for $DOMAIN and *.$DOMAIN"
echo ""
echo "IMPORTANT: Certbot will ask you to add a TXT DNS record in GoDaddy."
echo "Add it, wait ~60 seconds for DNS to propagate, then press Enter."
echo ""

# --manual + dns challenge because GoDaddy doesn't have a certbot plugin.
# This generates ONE cert that covers both emenu-cambodia.com AND *.emenu-cambodia.com
certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d "$DOMAIN" \
  -d "*.$DOMAIN" \
  --agree-tos \
  --email admin@emenu-cambodia.com

echo ""
echo "==> Copying Nginx config..."
cp "$(dirname "$0")/nginx.conf" /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN

# Remove default site if still there
rm -f /etc/nginx/sites-enabled/default

echo "==> Testing Nginx config..."
nginx -t

echo "==> Reloading Nginx..."
systemctl reload nginx

echo ""
echo "==> Setting up auto-renewal cron (every 12 hours)..."
(crontab -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

echo ""
echo "Done! SSL is live."
echo "  https://$DOMAIN              → owner dashboard (port 3001)"
echo "  https://mega-store.$DOMAIN   → customer menu  (port 3000)"
