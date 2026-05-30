# Telegram Integration Guide

This guide covers setting up and running Telegram notifications for the Cambodia E-Menu Platform.

## Overview

The Telegram integration allows:
- 📱 Automatic order notifications to business groups
- 👥 Staff notifications when new employees are added
- 📊 Subscription alerts for business owners
- 🔗 Easy group linking via `/link` command

## Architecture

```
Telegram Bot (@CambodiaEMenuBot)
         ↓
Telegram API (/setWebhook)
         ↓
Backend Webhook (/api/v1/telegram/webhook)
         ↓
TelegramWebhookController
         ↓
TelegramNotificationService
         ↓
Telegram Group (monitoring channel)
```

## Components

### Core Classes

| Class | Purpose |
|-------|---------|
| `TelegramNotificationService` | Main service for sending notifications |
| `TelegramWebhookController` | Handles incoming webhook requests |
| `TelegramMessageBuilder` | Formats message content |
| `TelegramWebhookInitializer` | Auto-configures webhook on startup |
| `TelegramStatusResponse` | Response DTO for webhook status |

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/telegram/webhook` | Receives bot commands (e.g., `/link`) |
| POST | `/api/v1/telegram/test/{businessId}` | Send test message to verify connection |
| GET | `/api/v1/telegram/status/{businessId}` | Get linking status for a business |

---

## Setup Guide

### Prerequisites

1. **Telegram Bot**: Already created (@CambodiaEMenuBot)
2. **Bot Token**: `8464259107:AAHdIC3EZb_3uID4vnhteY6PYtmO9WGDBjU`
3. **Backend**: Running on port 7070
4. **Database**: PostgreSQL or H2 (configured in `BusinessSetting.telegramGroupChatId`)

### Local Development Setup

#### Option 1: Using ngrok (Recommended for Testing)

**What is ngrok?**
- Exposes your local backend to the internet
- Creates a public URL for your localhost
- Perfect for testing webhooks locally

**Steps:**

1. **Install ngrok**
   ```bash
   # macOS with Homebrew
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start backend**
   ```bash
   cd menu-scanner-backend
   mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=h2"
   ```

3. **Start ngrok tunnel**
   ```bash
   ngrok http 7070
   ```
   
   You'll see:
   ```
   Forwarding    https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:7070
   ```
   
   **Copy this URL** ⬆️

4. **Set webhook (one-time per ngrok session)**
   ```bash
   curl -X POST https://api.telegram.org/bot8464259107:AAHdIC3EZb_3uID4vnhteY6PYtmO9WGDBjU/setWebhook \
     -d "url=https://xxxx-xxxx-xxxx.ngrok-free.app/api/v1/telegram/webhook"
   ```
   
   Expected response:
   ```json
   {"ok":true,"result":true,"description":"Webhook was set"}
   ```

5. **Test the integration**
   - Go to your Telegram group with the bot
   - Type: `/link 550cad56-cafd-4aba-baef-c4dcd53940d0`
   - Bot responds: "GROUP LINKED"
   - Business settings auto-updates with chat ID ✅

#### Option 2: Using Business Settings Form (Simplest)

If you don't want to use ngrok:

1. Get your group's chat ID from Telegram:
   ```
   Send to bot: /my_chat_id
   ```

2. Open Business Settings:
   ```
   http://localhost:3000/admin/manage-business-settings
   ```

3. Paste chat ID in "Telegram Monitoring" section
4. Click Save ✅

---

## Production Deployment

### Environment Variables

Set these on your production server:

```bash
# Bot token (keep secret!)
export TELEGRAM_BOT_TOKEN="your-bot-token"

# Your production domain
export TELEGRAM_WEBHOOK_URL="https://your-domain.com/api/v1/telegram/webhook"

# Admin group for subscription alerts
export TELEGRAM_GROUP_CHAT_ID="-1002784141362"
```

### Configuration (application.yaml)

```yaml
telegram:
  bot:
    token: "${TELEGRAM_BOT_TOKEN}"
    enabled: true
    group-chat-id: "${TELEGRAM_GROUP_CHAT_ID}"
    webhook-url: "${TELEGRAM_WEBHOOK_URL}"
    auto-setup: true  # Auto-configure webhook on startup
```

### Deployment Steps

1. **Deploy your backend** to production server

2. **Set environment variables**
   ```bash
   export TELEGRAM_WEBHOOK_URL="https://your-domain.com/api/v1/telegram/webhook"
   export TELEGRAM_BOT_TOKEN="your-token"
   ```

3. **Start backend**
   ```bash
   # On startup, TelegramWebhookInitializer will:
   # 1. Read TELEGRAM_WEBHOOK_URL
   # 2. Automatically configure webhook with Telegram API
   # 3. Log success/failure in application logs
   
   java -jar app.jar
   ```

4. **Verify webhook is set**
   ```bash
   curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo
   ```
   
   Should show your webhook URL configured ✅

5. **No manual curl commands needed!** 🎉
   - Webhook auto-configures on startup
   - If server reboots, webhook is re-configured automatically
   - You can redeploy without manual setup

---

## How It Works

### User Flow: Linking a Group

```
1. Admin creates/selects Telegram group
2. Admin adds bot to group
3. Admin promotes bot to Admin
4. Admin types: /link {business-id}
   ↓
5. Bot sends command to webhook
   ↓
6. TelegramWebhookController receives request
7. Validates business ID
8. Saves chat ID to BusinessSetting.telegramGroupChatId
9. Bot confirms: "GROUP LINKED"
   ↓
10. Admin sees chat ID in Business Settings
11. Orders now send notifications to group ✓
```

### Message Sending Flow

```
Order Created → Service calls notifyNewCustomerOrder()
   ↓
Telegram Notification Service checks:
  - Is Telegram enabled?
  - Does business have linked group?
   ↓
Yes → Telegram API sends message to group chat ID
   ↓
Group receives formatted order notification ✓
```

---

## Troubleshooting

### Webhook Not Receiving Events

**Check 1: Is webhook configured?**
```bash
curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo
```

Should show your webhook URL in `url` field.

**Check 2: Is endpoint public?**
- Verify `/api/v1/telegram/webhook` is in SecurityConfig permitAll()
- Telegram cannot send JWT tokens

**Check 3: Is domain accessible?**
```bash
curl -X POST https://your-domain.com/api/v1/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'
```

### Messages Not Sending

**Check 1: Is business linked?**
```bash
# Get business settings to verify telegramGroupChatId is set
GET /api/v1/business-settings/current
```

**Check 2: Check logs**
```bash
# Look for [Telegram] messages in application logs
grep "Telegram" application.log
```

**Check 3: Send test message**
```bash
POST /api/v1/telegram/test/{businessId}
```

### Auto-setup Not Working

**Check 1: Is environment variable set?**
```bash
echo $TELEGRAM_WEBHOOK_URL
# Should print your webhook URL
```

**Check 2: Check startup logs**
```bash
# Look for [Telegram] messages during startup
grep "Telegram" startup.log | head -20
```

**Check 3: Manual webhook setup**
```bash
curl -X POST https://api.telegram.org/bot{TOKEN}/setWebhook \
  -d "url=https://your-domain.com/api/v1/telegram/webhook"
```

---

## Configuration Profiles

### Local Development (application-local.yaml)
```yaml
telegram:
  bot:
    auto-setup: false  # Don't auto-setup locally with ngrok
```

### Production (application-prod.yaml)
```yaml
telegram:
  bot:
    auto-setup: true   # Auto-setup with permanent domain
```

---

## Security

- ✅ Webhook endpoint is public (no JWT required)
- ✅ Telegram API validates requests
- ✅ Bot token stored in environment variables
- ✅ Chat IDs stored per business
- ✅ Sensitive data not logged

---

## Database Schema

**Table: business_settings**

| Column | Type | Description |
|--------|------|-------------|
| `telegram_group_chat_id` | VARCHAR(50) | Telegram group chat ID |

**Relationships:**
- One BusinessSetting per Business
- One Telegram group per Business

---

## Example: Complete Flow

### 1. Business Admin Links Group

Terminal 1 (Backend):
```bash
mvn spring-boot:run
# Logs: [Telegram] Webhook initialized or skipped
```

Telegram Group:
```
Admin types: /link 550cad56-cafd-4aba-baef-c4dcd53940d0
Bot responds: GROUP LINKED - This group is now monitoring Mega Store
```

Business Settings:
```
Telegram Monitoring: ✅ Linked
Chat ID: -1002784141362
```

### 2. Customer Places Order

Order Service:
```java
telegramNotificationService.notifyNewCustomerOrder(order);
```

Telegram Group:
```
📋 NEW ORDER
Order: #ORD-12345
Customer: John Doe
Items: 
  - Pad Thai x1
  - Mango Lassi x2
Total: $15.50
```

### 3. Admin Sends Test Message

Frontend:
```
Business Settings → Send Test Message
```

Telegram Group:
```
✅ TEST MESSAGE
Your Telegram monitoring is working correctly.
```

---

## Quick Reference

| Task | Command/Action |
|------|-----------------|
| **Local Setup** | ngrok http 7070 |
| **Set Webhook (ngrok)** | curl -X POST ...setWebhook ... |
| **Test Linking** | /link {business-id} in Telegram |
| **Verify Setup** | curl ...getWebhookInfo |
| **Production Deploy** | Set env vars, start app (auto-setup) |
| **View Status** | GET /api/v1/telegram/status/{businessId} |
| **Send Test** | POST /api/v1/telegram/test/{businessId} |

---

## Next Steps

- [ ] Set up local development with ngrok
- [ ] Test `/link` command in Telegram group
- [ ] Verify chat ID appears in Business Settings
- [ ] Test order notifications
- [ ] Deploy to production
- [ ] Set TELEGRAM_WEBHOOK_URL environment variable
- [ ] Verify webhook auto-configures on startup

---

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Review application logs for [Telegram] messages
3. Verify environment variables are set
4. Ensure Telegram bot is promoted to Admin in group

---

**Last Updated:** 2026-05-30
**Version:** 1.0.0
