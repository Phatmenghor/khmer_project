# Global AOP Logging Setup Guide

## Overview

This guide explains how to set up comprehensive AOP logging for **ALL controllers and services** across your application with a single aspect.

## Architecture

### Single Aspect Covers Everything

```
GlobalLoggingAspect (1 aspect file)
├── All Controllers (* Controller)
├── All Services (* Service)
└── All Repositories (* Repository) [optional]
```

Instead of:
```
ProductLoggingAspect (Product only)
UserLoggingAspect (User only)
OrderLoggingAspect (Order only)
... (many files)
```

## Implementation

### 1. GlobalLoggingAspect (Already Created)

Located at: `src/main/java/com/emenu/features/shared/aspect/GlobalLoggingAspect.java`

**Covers:**
- ✅ ALL Controllers: `execution(public * com.emenu.features.*.controller.*Controller.*(..))`
- ✅ ALL Services: `execution(public * com.emenu.features.*.service.*.*(..))`
- ⭕ Repositories (optional, uncomment to enable)

### 2. Pointcut Explanations

```java
// Controllers: Matches any public method in any Controller class
@Around("execution(public * com.emenu.features.*.controller.*Controller.*(..))")

// Services: Matches any public method in Service/ServiceImpl classes
@Around("execution(public * com.emenu.features.*.service.*.*(..))")

// Repositories (optional): Matches any public method in Repository interfaces
@Around("execution(public * com.emenu.features.*.repository.*Repository.*(..))")
```

### 3. What Gets Logged

For every method call:

```
[CONTROLLER_ENTRY] UserController#login | Operation=login | Params=username=john, password=****
[CONTROLLER_EXIT] UserController#login | Operation=login | Result=LoginResponseDto[id=...] | Duration=150ms

[SERVICE_ENTRY] UserServiceImpl#authenticate | Operation=authenticate:uuid | Params=userId=550e8400-...
[SERVICE_ERROR] UserServiceImpl#authenticate | Operation=authenticate:uuid | Error=User not found | Duration=45ms
```

## Logging Levels

### Configuration

```yaml
# application.yml
logging:
  level:
    root: WARN                          # Default: only errors
    com.emenu: INFO                     # Application logs
    com.emenu.features: INFO            # Feature-level logs
    
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d %p %c{1.} [%t] %m%n"
    
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30
```

### Environment-Specific Profiles

**Development (dev):**
```yaml
# application-dev.yml
logging:
  level:
    com.emenu: DEBUG                    # See all details
    com.emenu.features.shared.aspect: DEBUG
```

**Production (prod):**
```yaml
# application-prod.yml
logging:
  level:
    com.emenu: INFO                     # Only important events
    com.emenu.features.shared.aspect: INFO
```

## Logback Configuration

For async logging (recommended for production):

```xml
<!-- logback-spring.xml -->
<configuration>
  <!-- Async appender for high-throughput logging -->
  <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>512</queueSize>
    <discardingThreshold>0</discardingThreshold>
    <appender-ref ref="FILE"/>
  </appender>

  <!-- File appender -->
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/application.log</file>
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss} [%-5level] %logger{36} - %msg%n</pattern>
    </encoder>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>logs/application-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
      <maxFileSize>10MB</maxFileSize>
      <maxHistory>30</maxHistory>
      <totalSizeCap>1GB</totalSizeCap>
    </rollingPolicy>
  </appender>

  <root level="INFO">
    <appender-ref ref="ASYNC"/>
  </root>

  <!-- Disable verbose loggers -->
  <logger name="org.springframework" level="WARN"/>
  <logger name="org.hibernate" level="WARN"/>
  <logger name="com.zaxxer.hikari" level="WARN"/>
</configuration>
```

## Performance Tuning

### Async Logging (Production)

```yaml
# application-prod.yml
logging:
  config: classpath:logback-spring.xml

# In logback-spring.xml:
<appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
  <queueSize>512</queueSize>           # Buffer size
  <discardingThreshold>0</discardingThreshold>
  <includeCallerData>false</includeCallerData>  # Skip expensive caller data
</appender>
```

### Disable Expensive Features

```yaml
# Don't log stacktraces for INFO/DEBUG
logging:
  level:
    com.emenu.features.shared.aspect: INFO  # Not DEBUG
    
  pattern:
    console: "%d{HH:mm:ss} [%-5level] %msg%n"  # Minimal pattern
```

## Selective Logging

### Disable Specific Layers

```yaml
logging:
  level:
    com.emenu.features.shared.aspect: OFF      # Disable all AOP logging
    # OR
    com.emenu.features: WARN                   # Only errors
```

### Enable Only Repositories (Optional)

```java
// In GlobalLoggingAspect.java - uncomment this:
@Around("execution(public * com.emenu.features.*.repository.*Repository.*(..))")
public Object logAllRepositories(ProceedingJoinPoint joinPoint) throws Throwable {
    return logOperation("REPOSITORY", joinPoint);
}
```

Then in config:
```yaml
logging:
  level:
    com.emenu.features.shared.aspect: INFO
```

## Comparison: Before vs After

### BEFORE (No AOP)

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequest request) {
        log.info("User login attempt - email: {}", request.getEmail());
        try {
            // ... business logic
            log.info("Login successful for user: {}", user.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed", e);
            throw e;
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        log.info("Fetching user: {}", id);
        try {
            // ... business logic
            log.info("User found: {}", user.getId());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("User fetch failed", e);
            throw e;
        }
    }
    
    // Repeat for every method... 😫
}
```

**Problems:**
- ❌ Logging code repeated in EVERY method
- ❌ Inconsistent logging patterns
- ❌ Easy to forget logging
- ❌ Hard to change logging globally

### AFTER (With AOP)

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequest request) {
        // ... business logic only, no logging code!
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        // ... business logic only, no logging code!
    }
    
    // AOP handles ALL logging automatically ✨
}
```

**Benefits:**
- ✅ Zero logging code in application
- ✅ Consistent logging everywhere
- ✅ Change logging globally in ONE place
- ✅ Focus on business logic only

## Log Output Examples

### Successful Controller Call
```
[CONTROLLER_ENTRY] UserController#login | Operation=login | Params=request=LoginRequest{email=john@example.com}
[CONTROLLER_EXIT] UserController#login | Operation=login | Result=ResponseEntity[status=200, body=LoginResponseDto[id=550e8400-...]] | Duration=215ms
```

### Service Layer Call
```
[SERVICE_ENTRY] UserServiceImpl#createUser | Operation=createUser | Params=request=CreateUserRequest{...}
[SERVICE_EXIT] UserServiceImpl#createUser | Operation=createUser | Result=UserDto[id=550e8400-...] | Duration=85ms
```

### Error Handling
```
[SERVICE_ENTRY] PaymentServiceImpl#processPayment | Operation=processPayment:550e8400-... | Params=orderId=...
[SERVICE_ERROR] PaymentServiceImpl#processPayment | Operation=processPayment:550e8400-... | Error=Insufficient funds | Duration=120ms
java.lang.IllegalArgumentException: Insufficient funds
    at com.emenu.features.payment.service.impl.PaymentServiceImpl.processPayment(...)
```

## Maintenance

### Adding New Controllers/Services

**No changes needed!** AOP automatically applies to:
- Any new Controller class
- Any new Service class
- Any new method

Just follow naming conventions:
- Controllers: `*Controller` 
- Services: `*Service` or `*ServiceImpl`

### Modifying Logging Format

Change ONE place:
```java
// In GlobalLoggingAspect.java - buildParamString(), buildResultInfo()
// All logs update automatically!
```

## Troubleshooting

### No logs appearing?
```yaml
# Check logging level
logging:
  level:
    com.emenu.features.shared.aspect: DEBUG
    
# Check if aspect is registered
# @Aspect and @Component must be present
```

### Logs too verbose?
```yaml
# Change log level
logging:
  level:
    com.emenu: WARN  # Only errors and warnings
```

### Performance issues?
```yaml
# Enable async logging in application-prod.yml
# Use minimal log pattern
logging:
  pattern:
    console: "%d %p %m%n"  # Minimal format
```

## Summary

| Task | Solution |
|------|----------|
| Log all controllers | ✅ `GlobalLoggingAspect` with `*Controller` pointcut |
| Log all services | ✅ `GlobalLoggingAspect` with `*Service` pointcut |
| Consistent logging | ✅ Single aspect handles formatting |
| Change logging format | ✅ Update one method in aspect |
| Performance | ✅ ~50-100μs overhead (negligible) |
| Maintain log code | ✅ No logging code in business classes |

**One aspect. All layers. Complete logging.** 🚀
