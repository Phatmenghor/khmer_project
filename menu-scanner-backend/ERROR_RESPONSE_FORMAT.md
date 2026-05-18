# Error Response Format Guide

## Request ID Format
```
REQ-{timestamp}-{sequence}-{uuid}

Examples:
REQ-12345-0001-A1B2C3D4E5F6
REQ-12346-0002-F6E5D4C3B2A1
REQ-12347-0003-9876543210AB
```

## Error Response Structure

### Generic Error Response
```json
{
  "status": "error",
  "message": "User not found",
  "data": {
    "requestId": "REQ-12345-0001-A1B2C3D4E5F6",
    "errorCode": "USER_NOT_FOUND",
    "errorType": "RESOURCE_NOT_FOUND",
    "description": "The user with ID 123 does not exist",
    "timestamp": "2026-05-18T14:30:45.123456",
    "path": "/api/users/123",
    "method": "GET",
    "statusCode": 404,
    "suggestion": "Please check the user ID and try again",
    "supportContact": "support@emenu-platform.com"
  },
  "requestId": "REQ-12345-0001-A1B2C3D4E5F6",
  "timestamp": "2026-05-18T14:30:45.123456",
  "code": "USER_NOT_FOUND"
}
```

## Common Error Types

### Authentication Errors
```json
{
  "errorType": "AUTHENTICATION",
  "errorCode": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "statusCode": 401
}
```

### Authorization Errors
```json
{
  "errorType": "AUTHORIZATION",
  "errorCode": "ACCESS_DENIED",
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

### Validation Errors
```json
{
  "errorType": "VALIDATION",
  "errorCode": "INVALID_INPUT",
  "message": "Email format is invalid",
  "statusCode": 400,
  "details": {
    "field": "email",
    "reason": "Email must contain @ symbol"
  }
}
```

### Resource Not Found
```json
{
  "errorType": "RESOURCE_NOT_FOUND",
  "errorCode": "PRODUCT_NOT_FOUND",
  "message": "Product with ID 999 not found",
  "statusCode": 404
}
```

### Conflict/Duplicate
```json
{
  "errorType": "CONFLICT",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "message": "Email address already registered",
  "statusCode": 409,
  "suggestion": "Please use a different email or login with your existing account"
}
```

### Server Error
```json
{
  "errorType": "SERVER_ERROR",
  "errorCode": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred",
  "statusCode": 500,
  "suggestion": "Please try again later or contact support"
}
```

## Response Fields Explanation

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **status** | string | Response status | "error", "success" |
| **message** | string | User-friendly message | "Invalid credentials" |
| **data** | object | Error details object | ErrorResponse object |
| **requestId** | string | Unique request identifier | "REQ-12345-0001-A1B2C3D4E5F6" |
| **timestamp** | datetime | When error occurred | "2026-05-18T14:30:45.123456" |
| **code** | string | Error classification code | "USER_NOT_FOUND" |

## ErrorResponse Fields

| Field | Type | Mandatory | Description |
|-------|------|-----------|-------------|
| **requestId** | string | ✅ | Unique request ID for tracking |
| **errorCode** | string | ✅ | System error code (e.g., USER_NOT_FOUND) |
| **errorType** | string | ✅ | Error category (VALIDATION, AUTHENTICATION, etc.) |
| **message** | string | ✅ | User-friendly error message |
| **description** | string | ❌ | Detailed technical description |
| **timestamp** | datetime | ✅ | ISO 8601 timestamp |
| **path** | string | ✅ | API endpoint path |
| **method** | string | ✅ | HTTP method (GET, POST, etc.) |
| **statusCode** | integer | ✅ | HTTP status code (400, 401, 404, 500, etc.) |
| **details** | object | ❌ | Additional error-specific details |
| **suggestion** | string | ❌ | Helpful suggestion for resolving error |
| **supportContact** | string | ❌ | Support email/contact info |

## Using Request ID for Debugging

### Step 1: Get Request ID from Error Response
```json
{
  "data": {
    "requestId": "REQ-12345-0001-A1B2C3D4E5F6"
  }
}
```

### Step 2: Search Logs
```bash
# Find error in logs
grep "REQ-12345-0001-A1B2C3D4E5F6" logs/error/*.log

# Find all related logs
grep -r "REQ-12345-0001-A1B2C3D4E5F6" logs/
```

### Step 3: Identify Error Type
- Check `errorType` field: VALIDATION, AUTHENTICATION, AUTHORIZATION, etc.
- Check `errorCode` field: USER_NOT_FOUND, INVALID_CREDENTIALS, etc.
- Use `statusCode` to understand HTTP status

### Step 4: Take Action
- Use `suggestion` field for user guidance
- Contact `supportContact` if needed
- Share `requestId` with support team for faster debugging

## Error Code Examples

| Error Code | HTTP Status | Error Type | Message |
|-----------|------------|-----------|---------|
| INVALID_CREDENTIALS | 401 | AUTHENTICATION | Invalid email or password |
| ACCESS_DENIED | 403 | AUTHORIZATION | You do not have permission |
| INVALID_INPUT | 400 | VALIDATION | Validation failed |
| USER_NOT_FOUND | 404 | RESOURCE_NOT_FOUND | User not found |
| EMAIL_ALREADY_EXISTS | 409 | CONFLICT | Email already registered |
| INTERNAL_SERVER_ERROR | 500 | SERVER_ERROR | Unexpected error occurred |

## Frontend Integration Example

### JavaScript/TypeScript
```javascript
const handleApiError = (response) => {
  const error = response.data;
  console.log(`Error ID: ${error.requestId}`);
  console.log(`Type: ${error.data.errorType}`);
  console.log(`Message: ${error.message}`);
  console.log(`Suggestion: ${error.data.suggestion}`);
  
  // Store request ID for support inquiry
  localStorage.setItem('lastErrorId', error.requestId);
  
  // Show user-friendly message
  showErrorNotification(error.message);
};
```

### Logging for Support
```javascript
const reportError = (response) => {
  const errorInfo = {
    requestId: response.data.requestId,
    timestamp: response.data.timestamp,
    errorCode: response.data.data.errorCode,
    message: response.data.message,
    path: response.data.data.path
  };
  
  // Send to error tracking service
  errorTracker.log(errorInfo);
};
```

## Benefits

✅ **Unique Request IDs**: No duplicates (timestamp + sequence + UUID)  
✅ **Structured Errors**: Consistent error response format  
✅ **Easy Debugging**: Request ID correlates API response with logs  
✅ **User Friendly**: Clear messages and suggestions  
✅ **Support Ready**: All info needed for support team  
✅ **Type Safe**: Dedicated ErrorResponse DTO  
✅ **Backward Compatible**: Works with existing code  
✅ **Extensible**: Optional fields for additional details  
