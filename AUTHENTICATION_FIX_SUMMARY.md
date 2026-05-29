# Authentication Error Handling Fix - Comprehensive Summary

## Problem Statement

The backend was returning incorrect error messages on login attempts:

**Backend logs showed:**
```
User login failed - user not found in business: identifier=phatmenghor200@gmail.com, business_id=550cad56-cafd-4aba-baef-c4dcd53940d0
Business validation error: Business user account not found. Please check your email or username...
```

**But frontend received:**
```
This username is already taken. Please choose a different username.
```

## Root Cause

`GlobalExceptionHandler.java` (lines 243-246) was applying registration-specific error transformations to ALL `ValidationException`s containing the substring "username", without considering the request context.

```java
// ❌ WRONG - Too generic
if (msgLower.contains("username") || msgLower.contains("already taken")) {
    message = "This username is already taken. Please choose a different username.";
}
```

**Why this broke login:**
1. Backend throws login error: `"Business user account not found. Please check your email or username..."`
2. Contains word "username" ✓
3. Matches the condition
4. Gets transformed to registration error: `"This username is already taken"`
5. Frontend shows wrong message

## Solution Implemented

Updated `GlobalExceptionHandler.handleValidationException()` to be **context-aware**:

```java
// ✅ CORRECT - Context-aware
if ((requestUri.contains("/register") || requestUri.contains("/owner")) &&
    (msgLower.contains("user identifier") || msgLower.contains("unique") && msgLower.contains("identifier"))) {
    // Only apply "ownerUserIdentifier" to registration endpoints
    errorData.put("field", "ownerUserIdentifier");
    message = "This username is already taken...";
}
// Login errors pass through unchanged
```

## Error Handling by Endpoint

### ✅ Login Endpoint: `/api/v1/auth/login`

| Scenario | Backend Error | Frontend Display |
|----------|---------------|------------------|
| User not found in business | `"Business user account not found..."` | `"Business user account not found..."` ✅ |
| Invalid password | `"Your password is incorrect..."` | `"Your password is incorrect..."` ✅ |
| User type mismatch | `"User type mismatch..."` | `"User type mismatch..."` ✅ |
| Missing business ID | `"Business ID is required..."` | `"Business ID is required..."` ✅ |
| Inactive business | `"Your business account is currently..."` | `"Your business account is currently..."` ✅ |
| Expired subscription | `"Your business subscription has expired..."` | `"Your business subscription has expired..."` ✅ |

### ✅ Registration Endpoint: `/api/v1/auth/register`

| Scenario | Backend Error | Frontend Display | Field |
|----------|---------------|------------------|-------|
| Duplicate username | `"user identifier already taken"` | `"This username is already taken"` ✅ | `ownerUserIdentifier` |
| Duplicate email | `"email already registered"` | Via DataIntegrityViolationException | `email` |
| Duplicate phone | `"phone already exists"` | Via DataIntegrityViolationException | `phoneNumber` |

## Files Changed

- `menu-scanner-backend/src/main/java/com/emenu/exception/GlobalExceptionHandler.java`
  - Updated `handleValidationException()` method
  - Added request URI context checking
  - Changed error detection from "contains username" to "registration endpoint + unique constraint"
  - Login errors now pass through unchanged

## Test Cases

### Test Case 1: Login with Non-existent User

**Steps:**
1. Navigate to `/login` (client project)
2. Enter: `phatmenghor200@gmail.com` (non-existent user)
3. Enter: `88889999` (any password)
4. Click "Sign In"

**Expected Result:**
```
Error Toast: "Business user account not found. Please check your email or username and ensure you're using the correct business account."
```

**Before Fix:** ❌ "This username is already taken"
**After Fix:** ✅ Correct message displayed

---

### Test Case 2: Login with Wrong Password

**Steps:**
1. Navigate to `/login`
2. Enter: `phatmenghor20@gmail.com` (valid user)
3. Enter: `wrongpassword` (incorrect password)
4. Click "Sign In"

**Expected Result:**
```
Error Toast: "Your password is incorrect. Please try again or reset your password if you've forgotten it."
```

**Before Fix:** ❌ Might show wrong message
**After Fix:** ✅ Correct message displayed

---

### Test Case 3: Register with Duplicate Username

**Steps:**
1. Navigate to registration page
2. Fill form with:
   - Email: `newuser@test.com`
   - Username: `phatmenghor20@gmail.com` (already exists)
   - Password: `test123456`
3. Click "Register"

**Expected Result:**
```
Error Toast: "This username is already taken. Please choose a different username."
Error Data: { "field": "ownerUserIdentifier", "type": "duplicate" }
```

**Before Fix:** ❌ Might not show this error properly
**After Fix:** ✅ Correct message + correct field

---

## User Type Support

All three user types work correctly:

### BUSINESS_USER
- Login requires: `userType: "BUSINESS_USER"` + `businessId` (UUID)
- Error: "Business user account not found" (if not found in that business)
- Error: "Your password is incorrect" (if password wrong)

### PLATFORM_USER
- Login requires: `userType: "PLATFORM_USER"` (no businessId needed)
- Error: "Account not found as platform user" (if not found)
- Error: "Your password is incorrect" (if password wrong)

### CUSTOMER
- Login requires: `userType: "CUSTOMER"` (no businessId needed)
- Error: "Account not found as customer" (if not found)
- Error: "Your password is incorrect" (if password wrong)

## Frontend Error Extraction Order

The frontend (api-wrapper.ts) extracts errors in this order:
1. `response.data.message` (most common - used for all login errors now) ✅
2. `error.message` (error object property)
3. `error` as string (direct return)
4. Fallback generic message

## Database Schema Notes

- `users.user_identifier` is UNIQUE **per business** (not globally)
- Login for BUSINESS_USER requires businessId to lookup correct user in that business
- This allows same username in different businesses

## Verification Commands

Test the backend validation directly:

```bash
# Test 1: Login with non-existent user
curl -X POST http://localhost:7070/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userIdentifier": "phatmenghor200@gmail.com",
    "password": "88889999",
    "userType": "BUSINESS_USER",
    "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0"
  }'

# Response should contain: "Business user account not found"
# Data should NOT contain: { "field": "ownerUserIdentifier" }

# Test 2: Login with correct user, wrong password
curl -X POST http://localhost:7070/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userIdentifier": "phatmenghor20@gmail.com",
    "password": "wrongpassword",
    "userType": "BUSINESS_USER",
    "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0"
  }'

# Response should contain: "Your password is incorrect"
# Data should NOT contain: { "field": "ownerUserIdentifier" }
```

## Commit Details

**Commit:** `d60dbee`
**Branch:** `claude/happy-bardeen-8nSRf`
**Message:** "fix: separate registration validation from login error handling"

## Related Files

- Backend: `GlobalExceptionHandler.java` (lines 232-275)
- Frontend Client: `auth-thunks.ts` (line 17: loginService)
- Frontend Client: `api-wrapper.ts` (line 36-37: error extraction)
- Frontend Owner: Similar structure to client
- Test Data: `comprehensive-test-data.sql` (test users documented)

## Summary

✅ **Login errors** now display correctly with proper messages
✅ **Registration errors** still show "username already taken" with ownerUserIdentifier field
✅ **All user types** (BUSINESS_USER, PLATFORM_USER, CUSTOMER) work correctly
✅ **No breaking changes** to existing endpoints
✅ **Context-aware** exception handling prevents message transformation conflicts
