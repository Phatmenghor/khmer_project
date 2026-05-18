# Structured Logging Guide

## Overview
This application implements comprehensive structured logging with request ID tracking for easy debugging and monitoring.

## Log File Structure

### Directory Layout
```
logs/
├── info/
│   ├── e-menu-scanner-2026-05-18-00.log
│   ├── e-menu-scanner-2026-05-18-01.log
│   ├── e-menu-scanner-2026-05-18-02.log
│   └── ... (hourly files)
└── error/
    ├── e-menu-scanner-error-2026-05-18-00.log
    ├── e-menu-scanner-error-2026-05-18-01.log
    ├── e-menu-scanner-error-2026-05-18-02.log
    └── ... (hourly files)
```

### File Naming Convention
- **Info Logs**: `e-menu-scanner-YYYY-MM-DD-HH.log`
- **Error Logs**: `e-menu-scanner-error-YYYY-MM-DD-HH.log`

Example:
- `e-menu-scanner-2026-05-18-14.log` → Info logs for May 18, 2026, 2:00 PM - 2:59 PM
- `e-menu-scanner-error-2026-05-18-14.log` → Error logs for May 18, 2026, 2:00 PM - 2:59 PM

## Request ID Tracking

### What is a Request ID?
Every API request is assigned a unique request ID (format: `REQ-XXXXXXXX`) for tracking purposes.

### In Log Files
Every log entry includes the request ID:
```
2026-05-18 14:30:45.123 [REQ-A1B2C3D4] [http-nio-8080-exec-1] INFO  com.emenu.features.auth.service.impl.UserServiceImpl - User created successfully: id=550e8400-e29b-41d4-a716-446655440000, identifier=john.doe@example.com, type=CUSTOMER, total_related_records=1
```

### In API Responses

#### Success Response
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "identifier": "john.doe@example.com"
  },
  "requestId": "REQ-A1B2C3D4"
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "User identifier already exists",
  "data": {
    "requestId": "REQ-X9Y8Z7W6",
    "errorCode": "USER_IDENTIFIER_EXISTS",
    "timestamp": "2026-05-18T14:30:45.123456",
    "path": "/api/auth/register",
    "method": "POST"
  },
  "requestId": "REQ-X9Y8Z7W6"
}
```

## How to Use Request ID for Debugging

### Step 1: Get Request ID from API Response
When an error occurs, the API response includes the `requestId`:
```
User receives error response with: "requestId": "REQ-X9Y8Z7W6"
```

### Step 2: Find the Corresponding Time Window
The request ID is also included in the logs. To find the related logs:

1. Check the error log file for the approximate time:
   - Current time: 2:45 PM (14:45)
   - Error log file: `logs/error/e-menu-scanner-error-2026-05-18-14.log`

2. Search for the request ID in the error log:
   ```bash
   grep "REQ-X9Y8Z7W6" logs/error/e-menu-scanner-error-2026-05-18-14.log
   ```

### Step 3: View Complete Request/Response Trail
All related logs for a single request share the same request ID:
```bash
# View all logs for this request (info + error)
grep "REQ-X9Y8Z7W6" logs/info/e-menu-scanner-2026-05-18-14.log
grep "REQ-X9Y8Z7W6" logs/error/e-menu-scanner-error-2026-05-18-14.log

# Or search all logs at once
grep -r "REQ-X9Y8Z7W6" logs/
```

## Log Rotation Policy

### Info Logs
- **Rotation**: Hourly
- **Max File Size**: 512 MB
- **Retention**: 168 hours (7 days)
- **Total Size Cap**: 10 GB

### Error Logs
- **Rotation**: Hourly
- **Max File Size**: 512 MB
- **Retention**: 720 hours (30 days)
- **Total Size Cap**: 15 GB

## Log Pattern Format

```
YYYY-MM-DD HH:mm:ss.SSS [REQUEST-ID] [THREAD-NAME] LOG-LEVEL LOGGER-NAME - MESSAGE
```

Example:
```
2026-05-18 14:30:45.123 [REQ-A1B2C3D4] [http-nio-8080-exec-1] INFO com.emenu.features.auth.service.impl.UserServiceImpl - User logged in successfully: identifier=john.doe@example.com, type=CUSTOMER, user_id=550e8400-e29b-41d4-a716-446655440000
```

## Common Use Cases

### 1. Debugging a User Report
**User says**: "I got an error when trying to login at 2:45 PM"

**Steps**:
```bash
# Get the error log for that hour
cat logs/error/e-menu-scanner-error-2026-05-18-14.log | grep -i "login\|authentication"

# If you have the request ID (REQ-XXXXX):
grep "REQ-XXXXX" logs/error/e-menu-scanner-error-2026-05-18-14.log
```

### 2. Monitoring Specific Feature
**Checking all user creation activities**:
```bash
grep -r "User created successfully" logs/info/ | head -20
```

### 3. Performance Analysis
**Finding slow requests** (look for timestamp differences):
```bash
grep "REQ-A1B2C3D4" logs/info/e-menu-scanner-2026-05-18-14.log | head -5
```

### 4. Error Tracking
**All errors in a time window**:
```bash
cat logs/error/e-menu-scanner-error-2026-05-18-14.log | grep "ERROR"
```

## Best Practices

1. **Always save the Request ID** from error responses for support/debugging
2. **Check the time** in the API response to identify the correct log file
3. **Use grep with request ID** to see the complete flow of a single request
4. **Monitor error log files** for patterns or recurring issues
5. **Archive logs regularly** before they reach size/time limits

## Log Levels

- **DEBUG**: Detailed diagnostic information (disabled in production)
- **INFO**: General informational messages (normal operations)
- **WARN**: Warning messages (potentially harmful situations)
- **ERROR**: Error messages (error events, might still continue)
- **FATAL**: Very severe error events (system might terminate)

## Integration with Monitoring Tools

### Using Request ID with ELK Stack
```json
{
  "timestamp": "2026-05-18T14:30:45.123Z",
  "level": "ERROR",
  "requestId": "REQ-A1B2C3D4",
  "logger": "com.emenu.features.auth.service.impl.UserServiceImpl",
  "message": "User authentication failed",
  "thread": "http-nio-8080-exec-1"
}
```

### Dashboard Query Examples
```
# Find all errors for a specific request
requestId:"REQ-A1B2C3D4"

# Find errors in a time window
timestamp:[2026-05-18T14:00:00 TO 2026-05-18T15:00:00] AND level:ERROR

# Find specific error type
errorCode:"USER_IDENTIFIER_EXISTS"
```

## Configuration Reference

**File**: `src/main/resources/logback-spring.xml`

Key properties:
- `LOG_PATH`: Directory where logs are stored (default: `logs/`)
- `LOG_FILE_NAME`: Base name for log files (default: `e-menu-scanner`)
- `LOG_PATTERN`: Format of log messages
- `MAX_FILE_SIZE`: Maximum size before rotation (default: 512 MB)

## Troubleshooting

### Issue: Log files not being created
- Check if `logs/` directory exists and has write permissions
- Verify logback configuration is correct
- Check application startup logs for configuration errors

### Issue: Cannot find request in logs
- Verify the correct log file (based on time and hour)
- Use correct request ID format (REQ-XXXXXXXX)
- Check both info and error logs
- Request may have been filtered out if logging level is too high

### Issue: Logs growing too large
- Verify rotation policy is working
- Check max file size and retention settings
- Monitor total size cap to prevent disk space issues
- Consider archiving or compressing old logs
