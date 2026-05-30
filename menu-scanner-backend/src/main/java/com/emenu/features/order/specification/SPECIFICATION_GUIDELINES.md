# Specification Guidelines - Clean Code Pattern

## Overview
All filtering and querying in the Order feature uses **JPA Specifications** - a type-safe, composable alternative to `@Query` annotations.

## Design Principles

### 1. **Only Expose Public API Methods**
Each Specification class should have a clear public API that services use.

```java
// ✅ GOOD - Clear, readable API
Specification<Order> spec = OrderSpecification.forBusiness(businessId)
    .and(OrderSpecification.byStatus(status));

// ❌ BAD - Exposing internal complexity
Specification<Order> spec = (root, query, cb) -> { ... }; // DON'T do this in services
```

### 2. **One Method Per Filter**
Each filter should be a separate, focused method:

```java
// ✅ Single Responsibility
public static Specification<Order> forBusiness(UUID businessId) { ... }
public static Specification<Order> byStatus(OrderStatus status) { ... }
public static Specification<Order> searchByOrderNumber(String orderNumber) { ... }

// ❌ NOT this - too many concerns in one method
public static Specification<Order> complexFilter(UUID id, Status s, String search) { ... }
```

### 3. **Null-Safe Filters**
All filters must handle NULL values gracefully:

```java
// ✅ Returns conjunction (no filtering) if null
public static Specification<Order> byStatus(OrderStatus status) {
    return (root, query, cb) -> {
        if (status == null) return cb.conjunction(); // No filtering if null
        return cb.equal(root.get("orderStatus"), status);
    };
}
```

### 4. **Combine with buildFilter()**
For common multi-filter use cases, create a `buildFilter()` helper:

```java
// ✅ Clean composition
Specification<Order> spec = OrderSpecification.buildFilter(
    businessId,
    orderStatus,
    paymentStatus,
    startDate,
    endDate,
    searchTerm
);

// Instead of chaining multiple .and() calls in the service
```

## File Structure

```
/order/
  ├── specification/
  │   ├── BaseSpecification.java          # Base class with common patterns
  │   ├── OrderSpecification.java         # Order entity filters
  │   ├── OrderPaymentSpecification.java  # OrderPayment entity filters
  │   ├── CartSpecification.java          # Cart entity filters
  │   └── SPECIFICATION_GUIDELINES.md     # This file
  │
  ├── repository/
  │   ├── OrderRepository.java            # No @Query here - uses Specifications
  │   └── OrderPaymentRepository.java
  │
  └── service/impl/
      ├── OrderServiceImpl.java            # Calls OrderSpecification methods
      └── OrderPaymentServiceImpl.java     # Calls OrderPaymentSpecification methods
```

## How to Create a New Specification Class

### Step 1: Extend BaseSpecification
```java
public class UserSpecification extends BaseSpecification {
    // Add public API methods here
}
```

### Step 2: Define Filter Methods
```java
public static Specification<User> active() {
    return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
}

public static Specification<User> byRole(Role role) {
    return (root, query, cb) -> {
        if (role == null) return cb.conjunction();
        return cb.equal(root.get("role"), role);
    };
}

public static Specification<User> searchByEmail(String email) {
    return (root, query, cb) -> {
        if (email == null || email.isBlank()) return cb.conjunction();
        return cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%");
    };
}
```

### Step 3: Create buildFilter() Helper
```java
public static Specification<User> buildFilter(Role role, String email, Boolean active) {
    return active()
        .and(byRole(role))
        .and(searchByEmail(email));
}
```

### Step 4: Update Repository
```java
@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    // Remove @Query methods - use Specifications instead
}
```

### Step 5: Update Service
```java
// ✅ GOOD - Using clean Specification API
@Override
public Page<User> getAllUsers(UserFilterRequest filter) {
    Specification<User> spec = UserSpecification.buildFilter(
        filter.getRole(),
        filter.getEmail(),
        true // only active users
    );
    return userRepository.findAll(spec, pageable);
}

// ❌ NOT this - don't expose Specification details to service
```

## Service Usage Examples

### Simple Filter
```java
Specification<Order> spec = OrderSpecification.forBusiness(businessId);
List<Order> orders = orderRepository.findAll(spec);
```

### Multiple Filters
```java
Specification<Order> spec = OrderSpecification.active()
    .and(OrderSpecification.forBusiness(businessId))
    .and(OrderSpecification.byStatus(status));
Page<Order> page = orderRepository.findAll(spec, pageable);
```

### Using buildFilter() Helper
```java
Specification<Order> spec = OrderSpecification.buildFilter(
    businessId, orderStatus, paymentStatus, startDate, endDate, searchTerm
);
Page<Order> page = orderRepository.findAll(spec, pageable);
```

## Common Specification Patterns

### Base Filters
```java
// Always provide "active()" or "isNotDeleted()" for soft-deleted entities
public static Specification<Entity> active() {
    return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
}
```

### ID Filtering
```java
public static Specification<Order> forBusiness(UUID businessId) {
    return (root, query, cb) -> {
        if (businessId == null) return cb.conjunction();
        return cb.equal(root.get("businessId"), businessId);
    };
}
```

### Status/Enum Filtering
```java
public static Specification<Order> byStatus(OrderStatus status) {
    return (root, query, cb) -> {
        if (status == null) return cb.conjunction();
        return cb.equal(root.get("orderStatus"), status);
    };
}
```

### Search/LIKE Filtering
```java
public static Specification<Order> searchByOrderNumber(String orderNumber) {
    return (root, query, cb) -> {
        if (orderNumber == null || orderNumber.isBlank()) return cb.conjunction();
        return cb.like(cb.lower(root.get("orderNumber")), "%" + orderNumber.toLowerCase() + "%");
    };
}
```

### Date Range Filtering
```java
public static Specification<Order> createdFrom(LocalDateTime startDate) {
    return (root, query, cb) -> {
        if (startDate == null) return cb.conjunction();
        return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
    };
}
```

### List Filtering (IN operator)
```java
public static Specification<OrderPayment> withStatuses(List<PaymentStatus> statuses) {
    return (root, query, cb) -> {
        if (statuses == null || statuses.isEmpty()) return cb.conjunction();
        return root.get("status").in(statuses);
    };
}
```

## Migration Checklist

When converting a repository from `@Query` to Specifications:

- [ ] Create corresponding Specification class
- [ ] Implement all filter methods (one per filter)
- [ ] Add `buildFilter()` helper for common use cases
- [ ] Add `JpaSpecificationExecutor<T>` to repository interface
- [ ] Remove `@Query` methods from repository
- [ ] Update services to use `Specification` API
- [ ] Add JavaDoc to all public methods
- [ ] Test with various filter combinations
- [ ] Verify NULL handling works correctly

## Benefits Summary

| Aspect | Before (@Query) | After (Specifications) |
|--------|-----------------|------------------------|
| **Type Safety** | ❌ String-based SQL | ✅ Compile-time safe |
| **Parameter Issues** | ❌ Type inference errors | ✅ Automatic handling |
| **Code Duplication** | ❌ Similar queries repeated | ✅ Reusable components |
| **Readability** | ❌ Complex SQL strings | ✅ Method names are self-documenting |
| **Flexibility** | ❌ Fixed query structure | ✅ Composable filters |
| **Testing** | ❌ Hard to test SQL | ✅ Easy to test methods |

