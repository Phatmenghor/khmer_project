#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# SSL setup for emenu-cambodia.com (wildcard via GoDaddy DNS challenge)
# Run as root on the server.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="emenu-cambodia.com"
EMAIL="phatmenghor19@gmail.com"

echo "=== Step 1: Install certbot (if not already present) ==="
if ! command -v certbot &>/dev/null; then
  dnf install -y epel-release
  dnf install -y certbot
fi

echo ""
echo "=== Step 2: Request wildcard certificate via manual DNS challenge ==="
echo "    This covers: ${DOMAIN}  AND  *.${DOMAIN}"
echo ""
certbot certonly \
  --manual \
  --preferred-challenges dns \
  --email "${EMAIL}" \
  --agree-tos \
  --no-eff-email \
  -d "${DOMAIN}" \
  -d "*.${DOMAIN}"

echo ""
echo "=== Step 3: IMPORTANT — what certbot asked you to do ==="
cat <<'MSG'
Certbot will print TWO TXT records to add in GoDaddy DNS:
  Name:  _acme-challenge.emenu-cambodia.com
  Value: <token1>

  Name:  _acme-challenge.emenu-cambodia.com   (yes, same name, second record)
  Value: <token2>

In GoDaddy:
  DNS → Add Record → Type: TXT → Host: _acme-challenge → Value: <token>

Wait ~2 minutes for DNS to propagate, then press Enter in the certbot prompt.

Cert will be saved to:
  /etc/letsencrypt/live/emenu-cambodia.com/fullchain.pem
  /etc/letsencrypt/live/emenu-cambodia.com/privkey.pem
MSG

echo ""
echo "=== Step 4: Copy nginx configs ==="
cp "$(dirname "$0")/emenu-api.conf"    /etc/nginx/conf.d/
cp "$(dirname "$0")/emenu-owner.conf"  /etc/nginx/conf.d/
cp "$(dirname "$0")/emenu-client.conf" /etc/nginx/conf.d/

echo ""
echo "=== Step 5: Test and reload nginx ==="
nginx -t && systemctl reload nginx

echo ""
echo "=== Step 6: Auto-renewal cron ==="
# Certbot auto-renew runs twice a day via the default systemd timer.
# For manual DNS certs we use a hook that reloads nginx after renewal.
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'HOOK'
#!/bin/bash
systemctl reload nginx
HOOK
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Verify the timer is active
systemctl enable --now certbot-renew.timer 2>/dev/null || \
  (crontab -l 2>/dev/null; echo "0 3,15 * * * certbot renew --quiet") | crontab -

echo ""
echo "=== Done! ==="
echo "Test your setup:"
echo "  curl -I https://emenu-cambodia.com"
echo "  curl -I https://api.emenu-cambodia.com/health"
echo "  curl -I https://test.emenu-cambodia.com"
