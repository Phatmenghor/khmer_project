# Cart API Debug Guide

## Problem
Click "Add to Cart" → UI shows item → UI removes item (disappears)

**Root cause**: API is returning a **product detail response** instead of a **cart response**

---

## Quick Diagnosis

### Step 1: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Add to Cart" on a product
4. Look for the request - what URL is it calling?

**Should be**: `POST /api/v1/cart`
**If you see**: `GET /api/v1/products/{id}` or something else → **WRONG ENDPOINT**

### Step 2: Check Response Structure
Click on the request and check the response body.

**Correct response should have**:
```json
{
  "status": "success",
  "data": {
    "items": [
      { "id": "...", "productId": "...", "quantity": 1, ... }
    ],
    "totalItems": 1,
    "subtotal": 19.8,
    "totalDiscount": 2.2,
    "finalTotal": 19.8
  }
}
```

**Wrong response you're getting**:
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "Product 87",
    "quantity": 1,    // ← This is product listing quantity, not cart!
    "displayPrice": 19.8,
    ...images, sizes, etc.
  }
}
```

---

## Advanced Debugging

### Option A: Check Frontend Cart Thunk

**File**: `src/redux/features/main/store/thunks/cart-thunks.ts`

```javascript
// Line 22-31: Add this logging
export const addToCart = createApiThunk<CartResponseModel, AddToCartRequest>(
  "cart/addToCart",
  async (data, signal) => {
    const { optimisticTimestamp, ...requestData } = data;

    // ADD THIS LOGGING:
    console.log("🔵 [CART] Sending request to /api/v1/cart", {
      url: "/api/v1/cart",
      method: "POST",
      payload: requestData,
    });

    const response = await axiosClientWithAuth.post("/api/v1/cart", requestData, {
      signal,
    });

    // ADD THIS LOGGING:
    console.log("🟢 [CART] Response received from /api/v1/cart", {
      status: response.data.status,
      dataType: Array.isArray(response.data.data?.items) ? "CART" : "NOT_CART",
      hasItems: !!response.data.data?.items,
      responseKeys: Object.keys(response.data.data),
    });

    return response.data.data;
  },
);
```

Then try adding to cart and check browser console for those logs.

---

### Option B: Check Backend Cart Controller

**File**: `menu-scanner-backend/src/main/java/com/emenu/features/order/controller/CartController.java`

Add logging:

```java
@PostMapping
public ResponseEntity<ApiResponse<CartSummaryResponse>> submitCartItem(
    @Valid @RequestBody CartItemCreateRequest request) {

    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log.info("🔵 [CART_API] submitCartItem called");
    log.info("Request body: {}", request);
    log.info("Product ID: {}", request.getProductId());
    log.info("Quantity: {}", request.getQuantity());

    CartSummaryResponse cart = cartService.submitCartItem(request);

    log.info("✅ Returning CartSummaryResponse");
    log.info("Cart items count: {}", cart.getItems().size());
    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", cart));
}
```

Restart backend and try adding to cart. Check logs:
- Are you seeing "submitCartItem called"?
- If YES → backend is receiving the request ✅
- If NO → request is going to wrong endpoint ❌

---

### Option C: Test API Directly with cURL

```bash
# Get your auth token first (login and copy from Network tab)
export TOKEN="your_bearer_token_here"
export PRODUCT_ID="544970d6-a778-4b61-8330-0fae27b8868f"

# Test the cart API
curl -X POST http://localhost:8080/api/v1/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "quantity": 1
  }' | jq .
```

**Expected output**: CartSummaryResponse with `"items": [...]`
**Wrong output**: Product detail response with just fields like `name`, `price`, etc.

---

## Common Causes & Fixes

### Cause 1: Wrong Endpoint in Thunk

**File**: `src/redux/features/main/store/thunks/cart-thunks.ts` line 27

❌ **Wrong**:
```typescript
const response = await axiosClientWithAuth.post("/api/v1/products", requestData, {
```

✅ **Correct**:
```typescript
const response = await axiosClientWithAuth.post("/api/v1/cart", requestData, {
```

### Cause 2: Response Interceptor Modifying Response

**File**: `src/utils/axios/index.ts` lines 410-476

Check if there's a response interceptor that's transforming the response incorrectly.

Look for anything that modifies `response.data`.

### Cause 3: Backend Routing Issue

Check if the request is being routed to the **product controller** instead of **cart controller**.

**Backend structure**:
- Cart: `com.emenu.features.order.controller.CartController` → `POST /api/v1/cart`
- Product: `com.emenu.features.main.controller.ProductController` → `GET /api/v1/products/{id}`

If they're both on the same prefix, routing might be wrong.

### Cause 4: Business ID Missing

The cart thunk doesn't send `businessId` in the POST body. But if the backend changed to require it:

**Current (no businessId)**:
```json
{
  "productId": "...",
  "productSizeId": null,
  "quantity": 1
}
```

**Might need to be**:
```json
{
  "productId": "...",
  "productSizeId": null,
  "quantity": 1,
  "businessId": "ed8f7c10-110f-4e85-b545-bd2889167aff"
}
```

Check the CartItemCreateRequest in backend - does it have a businessId field?

---

## What to Check Next

1. **Network tab**: What URL is actually being called?
2. **Browser console**: Any 404 errors or redirects?
3. **Backend logs**: Is CartController.submitCartItem being hit?
4. **Response structure**: Is it returning items[] or not?

---

## Quick Test Script

Add this to browser console while on the add-to-cart flow:

```javascript
// Monitor all POST requests to /cart
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  if (url.includes('/cart')) {
    console.log('🔵 FETCH /cart:', { url, method: options?.method, body: options?.body });
    return originalFetch.apply(this, args)
      .then(r => {
        console.log('🟢 Response:', r.status);
        return r.clone().json().then(json => {
          console.log('Response JSON:', json);
          return new Response(JSON.stringify(json), { status: r.status, headers: r.headers });
        });
      });
  }
  return originalFetch.apply(this, args);
};
```

---

## Files to Check

**Frontend**:
- `src/redux/features/main/store/thunks/cart-thunks.ts` (line 22-31) - POST endpoint
- `src/redux/features/main/store/slice/cart-slice.ts` (line 286-293) - response handling
- `src/utils/axios/index.ts` - response interceptors

**Backend**:
- `CartController.java` - POST /api/v1/cart endpoint
- `CartServiceImpl.java` - submitCartItem method
- `CartItemCreateRequest.java` - request DTO
- `CartSummaryResponse.java` - response DTO

---

## Expected Flow

```
User clicks "Add to Cart"
       ↓
ProductCard.handleAddToCart
       ↓
Redux: addLocalCartItem (optimistic update) ✅ Shows item in UI
       ↓
debouncedUpdate queued
       ↓
500ms debounce delay...
       ↓
POST /api/v1/cart with { productId, quantity: 1 }
       ↓
CartController.submitCartItem
       ↓
CartServiceImpl.submitCartItem
       ↓
Returns CartSummaryResponse with { items: [...], totalItems: 1, ... }
       ↓
Redux: updateCartFromResponse (merge with server data)
       ↓
UI updates to show latest cart state ✅
```

If item disappears, the problem is **between "Returns CartSummaryResponse" and "Redux: updateCartFromResponse"**

---

## Questions to Answer

1. What URL does Network tab show? ____________________
2. Does response have `"items": [...]`? YES / NO
3. Are backend controller logs being hit? YES / NO
4. What's the response.data structure? ____________________

Once you answer these, we can pinpoint the exact issue!
