# Auth Feature Refactoring Guide

## Overview
This document outlines the refactoring of the auth feature for clean code, improved maintainability, and better monitoring. The refactoring follows SOLID principles and clean architecture patterns.

## Phase 1: Shared Layer Creation

### Constants
**Location:** `com.emenu.shared.constants.*`

#### AuthConstants
- JWT token handling (Bearer prefix, expiration)
- System roles (PLATFORM_OWNER, BUSINESS_OWNER, CUSTOMER, ADMIN)
- Session operations (LOGOUT, PASSWORD_CHANGE, ADMIN_PASSWORD_RESET, TOKEN_REFRESH)
- Device types (MOBILE, TABLET, DESKTOP)
- Session statuses (ACTIVE, EXPIRED, REVOKED)
- Default values (UNKNOWN_IP, UNKNOWN_DEVICE)

#### BusinessConstants
- Default business settings (colors, name, tax percentage)
- Business statuses (ACTIVE, INACTIVE, SUSPENDED, CLOSED)

### Utilities
**Location:** `com.emenu.shared.utils.*`

#### EnumUtils
Centralized enum handling with null safety:
```java
EnumUtils.parseEnum(value, enumClass, fieldName)      // Parse with error throwing
EnumUtils.parseEnumOrNull(value, enumClass)           // Parse or return null
EnumUtils.normalize(value)                             // Normalize enum string
EnumUtils.normalizeOrThrow(value, fieldName)           // Normalize with validation
```

**Benefits:**
- Consistent enum parsing across all services
- Better error messages
- Null safety

#### FilterUtils
Collection handling utilities:
```java
FilterUtils.nullIfEmpty(collection)    // Convert empty to null
FilterUtils.isNotEmpty(collection)      // Check non-empty
FilterUtils.isEmpty(collection)         // Check empty
```

**Usage:** Replace all patterns like `(list != null && !list.isEmpty()) ? list : null`

#### TokenUtils
JWT token extraction and formatting:
```java
TokenUtils.extractTokenFromAuthHeader(header)    // Extract JWT
TokenUtils.buildAuthorizationHeader(token)       // Build header
TokenUtils.isValidAuthHeader(header)             // Validate format
```

**Benefits:**
- Centralized token handling
- Prevents duplication
- Better consistency

#### ValidationUtils
Reusable validation methods:
```java
ValidationUtils.requireNonNull(value, fieldName)       // Require non-null
ValidationUtils.requireNonEmpty(value, fieldName)      // Require non-empty
ValidationUtils.parseUUID(value, fieldName)            // Parse UUID safely
ValidationUtils.validateEqual(v1, v2, message)         // Assert equality
ValidationUtils.validateNotEqual(v1, v2, message)      // Assert inequality
```

### Validation
**Location:** `com.emenu.shared.validation.*`

`ValidationUtils` provides reusable validation patterns to avoid code duplication.

## Phase 2: Service Layer Improvements

### AuthServiceImpl
**Improvements:**
- ✅ Replace try-catch with proper exception handling
- ✅ Use shared TokenUtils for token extraction
- ✅ Use AuthConstants for magic strings
- ✅ Extract business validation to separate method
- ✅ Simplified login flow with improved logging
- ✅ Consistent error handling

**Key Methods:**
```java
login()              // Context-aware user authentication
logout()             // Blacklist token and revoke refresh tokens
changePassword()     // User password change with token revocation
adminResetPassword() // Admin password reset functionality
refreshToken()       // Access token refresh with rotation
```

### UserServiceImpl
**Improvements:**
- ✅ Replace RuntimeException with ValidationException
- ✅ Use FilterUtils.nullIfEmpty for collection filtering
- ✅ Remove duplicate nullIfEmpty method
- ✅ Add logging to delete operations
- ✅ Consistent exception handling

### BusinessServiceImpl
**Improvements:**
- ✅ Replace RuntimeException with ValidationException
- ✅ Use FilterUtils for status list filtering
- ✅ Remove unnecessary JavaDoc
- ✅ Standardize logging patterns

### RoleServiceImpl
**Improvements:**
- ✅ Use shared EnumUtils and FilterUtils
- ✅ Replace magic strings with AuthConstants
- ✅ Extract response building to private methods
- ✅ Improve validation with dedicated helpers
- ✅ Cleaner null check patterns

**Key Patterns:**
```java
// Before
String normalizedName = EnumNormalizer.normalizeString(request.getName());
UserType normalizedUserType = EnumNormalizer.normalizeUserType(request.getUserType());

// After
String normalizedName = EnumUtils.normalize(request.getName());
UserType normalizedUserType = EnumUtils.parseEnum(
    request.getUserType().toString(), UserType.class, "user type"
);
```

### UserSessionServiceImpl
**Improvements:**
- ✅ Use FilterUtils.nullIfEmpty for consistent filtering
- ✅ Good logging patterns maintained
- ✅ Shared utility imports

### RefreshTokenServiceImpl
- ✅ Already had good logging patterns
- ✅ Proper null handling

### SocialAuthServiceImpl
- ✅ Good logging with context markers
- ✅ Proper exception handling

## Phase 3: Code Quality Patterns

### Exception Handling
**Pattern:** Use custom exceptions, not RuntimeException
```java
// ❌ Before
.orElseThrow(() -> new RuntimeException("User not found"))

// ✅ After
.orElseThrow(() -> new ValidationException("User not found"))
```

### Collection Filtering
**Pattern:** Use FilterUtils for consistent null handling
```java
// ❌ Before
List<String> roles = (request.getRoles() != null && !request.getRoles().isEmpty())
    ? request.getRoles() : null;

// ✅ After
List<String> roles = FilterUtils.nullIfEmpty(request.getRoles());
```

### Magic Strings
**Pattern:** Use shared constants instead
```java
// ❌ Before
refreshTokenService.revokeAllUserTokens(user.getId(), "PASSWORD_CHANGE");

// ✅ After
refreshTokenService.revokeAllUserTokens(user.getId(), AuthConstants.SESSION_REASON_PASSWORD_CHANGE);
```

### Token Extraction
**Pattern:** Use TokenUtils
```java
// ❌ Before
String token = authHeader.replace("Bearer ", "");

// ✅ After
String token = TokenUtils.extractTokenFromAuthHeader(authHeader);
```

## Logging Guidelines

### Log Levels
- **INFO:** Business events (login, create, update, delete, password change)
- **WARN:** Validation failures, missing data, business rule violations
- **DEBUG:** Internal operations, query details (if needed)
- **ERROR:** Exceptions, system failures

### Best Practices
1. Include relevant context (user identifier, business ID, session ID)
2. Use structured logging with key-value pairs
3. Avoid logging sensitive data (passwords, tokens)
4. Keep messages concise but descriptive
5. Use consistent message format

### Example Patterns
```java
// ✅ Good
log.info("Login successful for user: {}", user.getUserIdentifier());
log.warn("Login denied - Business inactive: {} (status: {})", businessId, status);
log.error("Security violation - User ID mismatch on refresh token");

// ❌ Bad
log.info("User login");
log.warn("Business status check failed");
log.info("Processing logout with header: " + authHeader);
```

## DTO/Entity Mapping

### Current Mappers
All mappers are centralized in `com.emenu.features.auth.mapper.*`

**Key Files:**
- `UserMapper` - User entity to/from DTOs
- `BusinessMapper` - Business entity mapping
- `RoleMapper` - Role entity mapping
- `RefreshTokenMapper` - RefreshToken helper mapping
- `UserSessionMapper` - Session mapping with helpers

### Mapping Patterns
- Use MapStruct `@Mapping` annotations
- Leverage helper DTOs for complex mappings
- Use `@AfterMapping` for post-processing
- Handle null values gracefully

## Component Organization

### Structure
```
com.emenu.features.auth/
├── controller/          # REST endpoints
├── dto/                 # Data Transfer Objects
│   ├── request/         # Request DTOs
│   ├── response/        # Response DTOs
│   ├── filter/          # Filter request DTOs
│   ├── update/          # Update request DTOs
│   └── helper/          # Mapping helper DTOs
├── mapper/              # MapStruct mappers
├── models/              # JPA entities
├── repository/          # Data access layer
├── service/             # Service interfaces
├── service/impl/        # Service implementations
├── util/                # Shared utilities (deprecated - use shared layer)
├── enums/               # Auth-specific enums
└── constants/           # Auth-specific constants (deprecated - use shared layer)

com.emenu.shared/
├── constants/           # Global constants
├── utils/               # Global utilities
├── validation/          # Validation utilities
└── mapper/              # Global mappers
```

## Best Practices Going Forward

### 1. Error Handling
- Always use custom exceptions (ValidationException, ResourceNotFoundException, etc.)
- Provide meaningful error messages
- Log errors with context

### 2. Code Reuse
- Use FilterUtils for collection operations
- Use EnumUtils for enum handling
- Use TokenUtils for JWT operations
- Use ValidationUtils for validation

### 3. Logging
- Log at appropriate levels
- Include relevant context
- Avoid logging sensitive data

### 4. Comments
- Only add comments for non-obvious logic
- Explain WHY, not WHAT
- Keep comments concise

### 5. DTO/Entity Separation
- Never expose entities directly
- Always map entities to DTOs for responses
- Use mappers, not manual conversion

### 6. Testing
- Test error cases and validation
- Mock external dependencies
- Verify logging in critical flows

## Migration Checklist

For each new service or modification:
- [ ] Use AuthConstants instead of magic strings
- [ ] Use FilterUtils for collection filtering
- [ ] Use EnumUtils for enum operations
- [ ] Use ValidationException, not RuntimeException
- [ ] Use shared utils, not local utilities
- [ ] Add appropriate logging at INFO/WARN levels
- [ ] Document complex logic with brief comments
- [ ] Use DTOs for API responses, never expose entities
- [ ] Extract common validation to shared layer

## Performance Considerations

1. **Logging:** Keep logging levels appropriate
2. **Queries:** Use pagination for list operations
3. **Caching:** Implement where appropriate for roles and business settings
4. **Transactions:** Keep transaction scope minimal
5. **Collections:** Use filtering at database level when possible

## Future Improvements

1. Add structured logging with MDC for request tracing
2. Implement audit logging for sensitive operations
3. Add caching layer for roles and permissions
4. Extract more validation to dedicated validator classes
5. Add comprehensive error code enumeration
6. Implement rate limiting for login attempts
7. Add device fingerprinting for security
8. Implement automated token cleanup jobs

## References

- **SOLID Principles:** https://en.wikipedia.org/wiki/SOLID
- **Clean Code:** Robert C. Martin
- **Spring Security Best Practices:** https://spring.io/guides/gs/securing-web/
- **MapStruct Documentation:** https://mapstruct.org/
