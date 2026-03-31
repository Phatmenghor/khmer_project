# INFO Level Logging - Production Ready

## Overview

All logging is now **INFO level only** - clean, production-focused monitoring without debug clutter.

## Configuration

### All Environments
```yaml
# application.yaml (base)
logging:
  level:
    root: INFO
    com.emenu: INFO
    org.springframework: WARN
    org.hibernate: WARN
    com.zaxxer.hikari: WARN
```

### Log Output Format
```
HH:mm:ss [LEVEL] [Classname] [message]
```

## Log Examples - Clean & Focused

### Standard Operations
```
15:23:45 [INFO] [AuthController] [login:login | email:john@...|password:...|-]
15:23:45 [INFO] [AuthServiceImpl] [authenticate:55...8400]
15:23:46 [INFO] [UserRepository] [findByEmail:55...8400]
15:23:46 [INFO] [AuthServiceImpl_OK] [authenticate:55...8400 | UserDto | 150ms]
15:23:47 [INFO] [AuthController_OK] [login:login | ResponseEntity | 250ms]
```

### Errors Only
```
15:24:30 [ERROR] [PaymentServiceImpl] Error: InsufficientFundsException: Balance $5, required $100
java.lang.IllegalStateException: Insufficient funds
  at com.emenu.features.order.service.impl.PaymentServiceImpl.processPayment(...)
```

### Order Processing
```
15:25:00 [INFO] [OrderController] [createOrder:createOrder | request:CreateOrderRequest|...]
15:25:01 [INFO] [OrderServiceImpl] [createOrder:createOrder | -]
15:25:01 [INFO] [CartServiceImpl] [validateCart:validateCart | -]
15:25:01 [INFO] [CartServiceImpl_OK] [validateCart:validateCart | CartDto | 50ms]
15:25:01 [INFO] [PaymentServiceImpl] [processPayment:processPayment | -]
15:25:01 [INFO] [PaymentServiceImpl_OK] [processPayment:processPayment | PaymentDto | 500ms]
15:25:01 [INFO] [OrderServiceImpl_OK] [createOrder:createOrder | OrderDto | 600ms]
15:25:02 [INFO] [OrderController_OK] [createOrder:createOrder | ResponseEntity | 650ms]
```

## Performance Details from Logs

Every operation logs duration - easily extract performance metrics:

```bash
# Find all operations slower than 1 second
grep "ms]" logs/application.log | grep -E "[1-9]\d{3,}ms"

# Count average response time per endpoint
grep "AuthController_OK" logs/application.log | grep -oE "\d+ms\]" | sed 's/ms\]//g' | awk '{sum+=$1; count++} END {print "Average: " sum/count "ms"}'

# Find slowest operations
grep "_OK" logs/application.log | sort -k3 -t']' -rn | head -20
```

## Error Tracking

Errors are logged with full context:

```
15:30:45 [ERROR] [PaymentServiceImpl] Error: PaymentException: Gateway timeout
java.util.concurrent.TimeoutException: Request timed out after 30000ms
  at com.emenu.features.order.service.impl.PaymentServiceImpl.callGateway(PaymentServiceImpl.java:234)
  ... (full stack trace)
```

## Thread Safety

All concurrent operations tracked (no thread ID due to INFO simplification):

```
15:25:00 [INFO] [OrderController] [createOrder:createOrder | ...]
15:25:01 [INFO] [UserController] [login:login | ...]
15:25:02 [INFO] [PaymentController] [charge:charge | ...]
```

## What You Get

✅ **Clean logs** - No debug spam  
✅ **Full visibility** - All operations logged  
✅ **Performance metrics** - Duration for every call  
✅ **Error tracking** - Stack traces when needed  
✅ **Production-ready** - Async appender, rotation, compression  

## What You Don't Get

❌ Parameter details (kept simple)  
❌ Thread names (less relevant in managed thread pools)  
❌ Caller information (expensive, rarely needed)  
❌ Debug statements (not in production)  

## File Rotation

Logs automatically rotate:
- **Size-based:** 10MB per file
- **Time-based:** Daily rotation
- **Compression:** .gz format
- **Retention:** 30 days
- **Cap:** 500MB total

## Environment-Specific

### Development (application-dev.yaml)
```yaml
logging:
  level:
    com.emenu: DEBUG  # More details
```

### Production (application-prod.yaml)
```yaml
logging:
  config: classpath:logback-spring.xml  # Async appender
```

### Test (application-test.yaml)
```yaml
logging:
  level:
    root: ERROR  # Errors only
```

## Troubleshooting

### Too many logs?
```yaml
logging:
  level:
    com.emenu: WARN  # Only warnings+
```

### Not seeing logs?
```yaml
logging:
  level:
    com.emenu: DEBUG  # Everything
    org.springframework: DEBUG
```

### Performance issues?
- Logs use async appender (non-blocking)
- Compression enabled (minimal disk I/O)
- Properly configured for production

## Summary

| Aspect | What Changed |
|--------|---|
| **Log Level** | INFO only (no DEBUG) |
| **Format** | Compact, clean output |
| **Performance** | Async appender enabled |
| **Visibility** | Complete (all operations) |
| **Maintenance** | Single aspect (GlobalLoggingAspect) |

**Your backend now has production-grade, INFO-level logging! 🚀**
