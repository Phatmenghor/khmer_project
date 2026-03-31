# Complete Monitoring Guide - GlobalLoggingAspect

## Overview

Your backend now uses a **single, centralized GlobalLoggingAspect** for all logging. No more scattered `@Slf4j` annotations or manual logging code.

**Everything is automatically logged:**
- ✅ ALL Controllers
- ✅ ALL Services  
- ✅ ALL Repositories
- ✅ ALL Security operations
- ✅ ALL Configuration & utilities

## What Changed

### Before (Old Way)
```
67 files with @Slf4j
+ 1000+ manual log statements
+ ProductLoggingAspect (partial logging)
= ❌ Scattered logging, hard to maintain
```

### After (New Way)
```
GlobalLoggingAspect (1 aspect)
= ✅ Complete logging, centralized control
```

## Complete Log Examples

### User Login (Controller → Service → Repository)

```
[CONTROLLER_ENTRY] AuthController#login | Operation=login | Thread=main[1] | Params=request=LoginRequest{email=john@example.com}

[SERVICE_ENTRY] AuthServiceImpl#authenticate | Operation=auth | Thread=main[1] | Params=email=john@example.com

[REPOSITORY_ENTRY] UserRepository#findByEmail | Operation=findByEmail:john@example.com | Thread=main[1]
[REPOSITORY_EXIT] UserRepository#findByEmail | Duration=15ms | Result=User[id=550e8400-...]

[SERVICE_EXIT] AuthServiceImpl#authenticate | Duration=85ms | Result=AuthResponseDto[id=550e8400-...]

[CONTROLLER_EXIT] AuthController#login | Duration=215ms | Result=ResponseEntity[status=200]
```

### Order Processing (Multi-Service Flow)

```
[CONTROLLER_ENTRY] OrderController#createOrder | Operation=createOrder | Params=request=CreateOrderRequest{...}

[SERVICE_ENTRY] OrderServiceImpl#createOrder | Duration=120ms
  [SERVICE_ENTRY] CartServiceImpl#validateCart | Duration=45ms
  [REPOSITORY_ENTRY] ProductRepository#findByIdIn | Duration=30ms
  [SERVICE_EXIT] CartServiceImpl#validateCart

  [SERVICE_ENTRY] PaymentServiceImpl#processPayment | Duration=500ms
  [REPOSITORY_ENTRY] PaymentRepository#save | Duration=20ms
  [SERVICE_EXIT] PaymentServiceImpl#processPayment

[SERVICE_EXIT] OrderServiceImpl#createOrder | Duration=620ms | Result=OrderDto[id=123]

[CONTROLLER_EXIT] OrderController#createOrder | Duration=650ms
```

### Error Handling with Full Stack Trace

```
[CONTROLLER_ENTRY] PaymentController#charge | Operation=charge:550e8400-... | Thread=main[1]

[SERVICE_ENTRY] PaymentServiceImpl#processPayment | Operation=processPayment:550e8400-...

[SERVICE_ERROR] PaymentServiceImpl#processPayment | Error=InsufficientFundsException: Customer balance is $5.00, required: $100.00 | Duration=120ms
java.lang.IllegalStateException: Insufficient funds
    at com.emenu.features.order.service.impl.PaymentServiceImpl.processPayment(PaymentServiceImpl.java:145)
    at com.emenu.features.order.service.impl.OrderServiceImpl.validatePayment(OrderServiceImpl.java:89)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    ...
```

## Log Output Format

### Entry Log
```
[LAYER_ENTRY] ClassName#methodName | Operation=operationId | Thread=threadName[threadId] | Params=param1=value1, param2=value2
```

### Exit Log (Success)
```
[LAYER_EXIT] ClassName#methodName | Operation=operationId | Result=ResultType[details] | Duration=XXXms | Thread=threadName[threadId]
```

### Exit Log (Error)
```
[LAYER_ERROR] ClassName#methodName | Error=ExceptionType: message | Duration=XXXms | Thread=threadName[threadId]
<full stack trace>
```

## Layers Being Logged

| Layer | Pattern | Examples |
|-------|---------|----------|
| **CONTROLLER** | `execution(public * com.emenu.features.*.controller.*Controller.*(..))` | UserController, ProductController, OrderController |
| **SERVICE** | `execution(public * com.emenu.features.*.service.*.*(..))` | UserServiceImpl, OrderServiceImpl, PaymentServiceImpl |
| **REPOSITORY** | `execution(public * com.emenu.features.*.repository.*Repository.*(..))` | UserRepository, OrderRepository, ProductRepository |
| **CONFIG** | `execution(public * com.emenu.config.*.*(..))` | DataInitializationService, SecurityConfig |
| **SECURITY** | `execution(public * com.emenu.security.*.*(..))` | JWTAuthenticationFilter, TokenBlacklistService |
| **UTIL** | `execution(public * com.emenu.shared.*.*(..))` | PaginationUtils, ReferenceNumberGenerator |

## Configuration

### Development (Full Logging)

```yaml
# application-dev.yml
logging:
  level:
    root: WARN
    com.emenu: DEBUG  # See everything
    
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    
  file:
    name: logs/application-dev.log
```

**Output:**
```
15:23:45.123 [main] INFO  GlobalLoggingAspect - [CONTROLLER_ENTRY] AuthController#login | ...
15:23:45.145 [main] INFO  GlobalLoggingAspect - [SERVICE_ENTRY] AuthServiceImpl#authenticate | ...
15:23:45.160 [main] INFO  GlobalLoggingAspect - [REPOSITORY_ENTRY] UserRepository#findByEmail | ...
15:23:45.175 [main] INFO  GlobalLoggingAspect - [REPOSITORY_EXIT] UserRepository#findByEmail | Duration=15ms | ...
15:23:45.230 [main] INFO  GlobalLoggingAspect - [SERVICE_EXIT] AuthServiceImpl#authenticate | Duration=85ms | ...
15:23:45.350 [main] INFO  GlobalLoggingAspect - [CONTROLLER_EXIT] AuthController#login | Duration=215ms | ...
```

### Production (Optimized Performance)

```yaml
# application-prod.yml
logging:
  config: classpath:logback-spring.xml
  level:
    root: WARN
    com.emenu: INFO  # Only important events
    
  pattern:
    console: "%d %p %m%n"  # Minimal format
```

### Quiet Mode (Only Errors)

```yaml
# application-test.yml
logging:
  level:
    root: ERROR
    com.emenu: ERROR  # Only errors
```

## Logback Configuration (Production)

For **high-performance async logging**, use this `logback-spring.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <property name="LOG_FILE" value="logs/application.log"/>
  <property name="LOG_PATTERN" value="%d{yyyy-MM-dd HH:mm:ss} [%-5level] %logger{36} - %msg%n"/>

  <!-- Async Appender (non-blocking, high throughput) -->
  <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>512</queueSize>
    <discardingThreshold>0</discardingThreshold>
    <includeCallerData>false</includeCallerData>
    <appender-ref ref="FILE"/>
  </appender>

  <!-- File Appender -->
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_FILE}</file>
    <encoder>
      <pattern>${LOG_PATTERN}</pattern>
    </encoder>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>logs/application-%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
      <maxFileSize>50MB</maxFileSize>
      <maxHistory>30</maxHistory>
      <totalSizeCap>1GB</totalSizeCap>
    </rollingPolicy>
  </appender>

  <!-- Console Appender (for local development) -->
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>${LOG_PATTERN}</pattern>
    </encoder>
  </appender>

  <!-- Root Logger -->
  <root level="INFO">
    <appender-ref ref="ASYNC"/>
    <appender-ref ref="CONSOLE"/>
  </root>

  <!-- Reduce noise from frameworks -->
  <logger name="org.springframework" level="WARN"/>
  <logger name="org.hibernate" level="WARN"/>
  <logger name="com.zaxxer.hikari" level="WARN"/>
  <logger name="org.thymeleaf" level="WARN"/>
</configuration>
```

## Monitoring Patterns

### Monitor by Layer

**Watch only Controllers:**
```yaml
logging:
  level:
    com.emenu: WARN
    com.emenu.features.*.controller: DEBUG
```

**Watch only Services:**
```yaml
logging:
  level:
    com.emenu: WARN
    com.emenu.features.*.service: DEBUG
```

**Watch only Repositories (Query Performance):**
```yaml
logging:
  level:
    com.emenu: WARN
    com.emenu.features.*.repository: DEBUG
```

### Monitor by Feature

**Monitor only Auth feature:**
```yaml
logging:
  level:
    com.emenu: WARN
    com.emenu.features.auth: DEBUG
```

**Monitor only Order feature:**
```yaml
logging:
  level:
    com.emenu: WARN
    com.emenu.features.order: DEBUG
```

### Monitor by Component

**Monitor only Security:**
```yaml
logging:
  level:
    com.emenu: WARN
    com.emenu.security: DEBUG
    com.emenu.features.shared.aspect: DEBUG
```

## Performance Metrics from Logs

Extract duration from logs to monitor performance:

```bash
# Show all requests longer than 1 second
grep -E "Duration=[1-9]\d{3,}ms" logs/application.log

# Count average request duration
grep "CONTROLLER_EXIT" logs/application.log | grep -oE "Duration=\d+ms" | sed 's/Duration=//g' | sed 's/ms//g' | awk '{sum+=$1; count++} END {print sum/count}'

# Find slowest requests
grep "CONTROLLER_EXIT" logs/application.log | grep -oE "\[CONTROLLER_EXIT\][^|]+|Duration=\d+ms" | paste - - | sort -k4 -rn | head -20

# Find errors
grep "ERROR" logs/application.log | head -100
```

## Thread Monitoring

All logs include thread information:

```
[CONTROLLER_ENTRY] UserController#login | Thread=http-nio-8080-exec-1[45]
```

**Monitor thread usage:**
```bash
# Count requests per thread
grep "ENTRY" logs/application.log | grep -oE "Thread=\w+\[\d+\]" | sort | uniq -c | sort -rn

# Find thread bottlenecks
grep "Duration=" logs/application.log | grep -E "Duration=[5-9]\d{3,}ms|Duration=\d{5,}ms" | grep -oE "Thread=\w+\[\d+\]"
```

## Integration with Monitoring Tools

### Splunk / ELK Stack Integration

Logs are structured for easy parsing:

```
Pattern: [LAYER_EVENT] ClassName#methodName | Operation=id | Detail=value

Splunk search:
index=application layer=SERVICE event=ERROR 
| stats count by className, error

ELK Logstash filter:
filter {
  grok {
    match => { "message" => "\[%{WORD:layer}_%{WORD:event}\].*Duration=%{NUMBER:duration:int}ms" }
  }
}
```

### Prometheus Metrics

Extract custom metrics from logs:

```bash
# Prometheus metric for average response time
echo 'response_time_ms{controller="AuthController",method="login"} '$(grep 'AuthController#login.*CONTROLLER_EXIT' logs/application.log | tail -1 | grep -oE 'Duration=\d+' | cut -d= -f2)
```

## Troubleshooting

### No logs appearing?

1. Check application is running with logging enabled:
   ```yaml
   logging:
     level:
       com.emenu: INFO
   ```

2. Check logback configuration is present: `logback-spring.xml`

3. Verify GlobalLoggingAspect is enabled:
   ```java
   @Aspect
   @Component  // Must have this
   public class GlobalLoggingAspect { ... }
   ```

### Logs too verbose?

```yaml
logging:
  level:
    com.emenu: WARN  # Only warnings and errors
```

### Performance degradation?

1. Enable async appender in `logback-spring.xml`
2. Reduce log level in production
3. Use minimal log pattern

### Finding specific operation?

```bash
# Find all requests for user ID 550e8400-...
grep "550e8400-" logs/application.log

# Find all "login" operations
grep "Operation=login" logs/application.log

# Find operations slower than 5 seconds
grep -E "Duration=[5-9]\d{3}ms|Duration=\d{5}ms" logs/application.log
```

## Migration from Old System

**Old code (removed):**
```java
@Slf4j
public class UserController {
    public void login() {
        log.info("User login");
        // ... business logic
        log.info("Login successful");
    }
}
```

**New code (no changes needed!):**
```java
public class UserController {
    public void login() {
        // GlobalLoggingAspect logs automatically!
        // ... business logic only
    }
}
```

## Summary

| Feature | Before | After |
|---------|--------|-------|
| Logging code | 1000+ lines | 0 lines |
| Logging locations | Scattered | Centralized |
| Consistency | ❌ Manual | ✅ Automatic |
| Easy to modify | ❌ Hard (67 files) | ✅ Easy (1 file) |
| Performance | ❌ Unknown | ✅ Monitored |

**You now have complete, automatic logging across your entire backend! 🎉**
