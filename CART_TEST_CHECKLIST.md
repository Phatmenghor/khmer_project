# Cart State Synchronization Test Checklist

## Overview
This document verifies the cart state sync system works correctly after the GvTPW fixes.

**Key Fix**: Corrected `handleAddToCart` to treat first add as 0→1 transition (never use product.quantity from listing)

---

## Test Scenarios

### 1. Basic Add-to-Cart Flow (Non-Sized Product)

**Setup**: User on Home page, product card visible

**Steps**:
1. Click "Add to Cart" button on a non-sized product
2. Observe:
   - [ ] Button immediately shows +/- controls
   - [ ] Cart badge in navbar increments instantly
   - [ ] Redux store shows quantity = 1
   - [ ] No loading spinner on button
3. Wait 500ms+
4. Observe:
   - [ ] Network request fires to `/api/v1/cart` (POST)
   - [ ] Request body has `{ productId: "...", quantity: 1 }`
   - [ ] Backend returns cart with item quantity = 1

**Expected**: Single API call, quantity = 1, item added to cart

---

### 2. Rapid +/- Clicks (Debounce Test)

**Setup**: Product already in cart (quantity = 1), showing +/- controls

**Steps**:
1. Click "+" button 5 times rapidly (within 500ms)
2. Observe:
   - [ ] UI updates instantly each time (quantity shows 2, 3, 4, 5, 6)
   - [ ] Only 1 API request fires (after 500ms of last click)
   - [ ] API request has quantity = 6 (latest state)
3. Click "-" button 2 times
4. Observe:
   - [ ] UI updates instantly (quantity shows 5, 4)
   - [ ] New API request fires (after 500ms of last click)
   - [ ] API has quantity = 4

**Expected**:
- Multiple clicks = 1 API call with final quantity
- Debounce timer resets on each click
- No loading states (optimistic UI)

---

### 3. Add While Previous Request In-Flight

**Setup**: Slow network (throttled to 2G in DevTools)

**Steps**:
1. Click "+" on product with slow network
2. Observe API request starts
3. Immediately click "+" again before response arrives
4. Observe:
   - [ ] Second click queues in pending updates
   - [ ] First API request still in-flight
   - [ ] When first completes, second request fires immediately with latest quantity
   - [ ] No "double API call" spam

**Expected**: Serial processing - requests never overlap

---

### 4. Conflict Resolution: Stale API Response

**Setup**: Manipulate network to receive out-of-order responses

**Steps**:
1. Click "+" (timestamp T1, quantity 2)
2. Click "+" (timestamp T2, quantity 3) - starts new request
3. First API call (T1) somehow arrives after second (T2) response
4. Observe Redux state:
   - [ ] Second response sets quantity = 3
   - [ ] First response arrives with quantity = 2
   - [ ] Redux checks: T1 < T2, so T1 is stale → discarded
   - [ ] Final quantity stays = 3

**Expected**: Newer updates always win, stale responses ignored

---

### 5. Quantity = 0 → Remove Item

**Setup**: Product in cart with quantity = 2

**Steps**:
1. Click "-" button twice
2. Observe:
   - [ ] First click: quantity shows 1
   - [ ] Second click: quantity shows 0, item removed from UI
   - [ ] Toast notification: "Removed from cart"
3. Network tab shows:
   - [ ] API request with `quantity: 0`
4. Backend deletes item

**Expected**: Item removed from both UI and backend

---

### 6. Sized Products: Modal Flow

**Setup**: User on product card for sized product

**Steps**:
1. Click "Add to Cart" button
2. Observe:
   - [ ] Size selection modal opens (NOT direct add)
   - [ ] Shows all available sizes
   - [ ] Each size shows current quantity in cart
3. Select size, adjust quantity to 2
4. Click "Add to Cart" in modal
5. Observe:
   - [ ] Modal closes
   - [ ] Product card updates to show quantity = 2
   - [ ] API request fires
   - [ ] If multiple sizes modified, all sent in single Promise.all batch

**Expected**: Modal handles sized products separately from card

---

### 7. Cart Page Quantity Updates

**Setup**: User on cart page (/cart)

**Steps**:
1. Load cart page
   - [ ] Shows all cart items with quantities
   - [ ] Skeleton loading while fetching
2. Click "+" on an item
   - [ ] Quantity increments instantly
   - [ ] No loading spinner
   - [ ] Debounce timer starts
3. Wait 500ms
   - [ ] API request fires
   - [ ] Cart subtotal/total updates
4. Click "Remove" button (trash icon)
   - [ ] Item removes immediately
   - [ ] Toast shows "Item removed from cart"
   - [ ] API request fires immediately (no debounce)

**Expected**: Same debounce pattern as product card

---

### 8. Cross-Navigation: Home → Cart Page

**Setup**: Add item on home, navigate to cart

**Steps**:
1. On home page, add product (quantity = 1)
2. API request in-flight
3. Navigate to /cart (before API response)
4. Observe cart page:
   - [ ] Shows item in cart with quantity = 1 (from optimistic update)
   - [ ] No duplicate items
   - [ ] When API response arrives, cart merges it correctly
5. Navigate back to home
   - [ ] Product card still shows quantity = 1
   - [ ] Redux state consistent

**Expected**: Cart state shared across all pages via Redux

---

### 9. Authentication: Login State Requirement

**Setup**: Not logged in

**Steps**:
1. Click "Add to Cart" on product card
2. Observe:
   - [ ] Login modal opens
   - [ ] Add to cart is blocked
3. Click "Sign In" button
4. Login flow happens
5. After login, observe:
   - [ ] Cart loads
   - [ ] Can add items normally

**Expected**: Cart operations require authentication

---

### 10. Product Unavailable: Status Changes

**Setup**: Product in cart becomes OUT_OF_STOCK on backend

**Steps**:
1. Add product (status = ACTIVE at add time)
2. Backend marks product as OUT_OF_STOCK
3. User goes to /cart
4. Cart page fetches fresh cart
5. Observe:
   - [ ] Backend filters out unavailable products (CartServiceImpl.filterUnavailableItems)
   - [ ] Product removed from cart automatically
   - [ ] User sees updated cart without the item

**Expected**: Stale/unavailable products removed on next fetch

---

### 11. Network Failure: Offline Scenario

**Setup**: Product in cart, network goes offline

**Steps**:
1. Click "+" on product
2. Optimistic update happens (UI changes immediately)
3. Network request fails (timeout or 500 error)
4. Observe:
   - [ ] UI shows quantity = 2 (optimistic state)
   - [ ] Toast error shown
   - [ ] State preserved (can retry manually)
5. Network comes back online
6. Manual retry or next user action:
   - [ ] Request retries
   - [ ] Backend applies final state

**Expected**: Optimistic UI survives network errors, can retry

---

### 12. Performance: Many Items in Cart

**Setup**: Cart with 50+ items, rapid quantity updates

**Steps**:
1. Click "+/-" on multiple products rapidly
2. Observe:
   - [ ] Each product has its own debounce timer
   - [ ] All API calls fire in parallel (different items)
   - [ ] UI remains responsive
   - [ ] No jank or lag
3. Check network tab:
   - [ ] Multiple concurrent POST /api/v1/cart requests
   - [ ] Each with different productId
   - [ ] Quantity updated correctly for each

**Expected**: Efficient handling of many concurrent item updates

---

## Edge Cases to Verify

### Edge Case 1: Spam Prevention
- Modify `DEBOUNCE_DELAY` to 100ms
- Click "+" 10 times in 500ms
- Verify only 1 API call, not 10

### Edge Case 2: Unmount During Request
- Click "+" on product card
- Navigate away (unmount component) before API response
- Verify: request is properly cancelled, no errors in console

### Edge Case 3: Size Modal + Product Card Interaction
- Open size modal for product
- Modify quantity to 5
- Without saving modal, click "+" on product card
- Verify: modal changes take precedence or are handled correctly

### Edge Case 4: Redux State Persistence
- Add items to cart
- Hard refresh page (Cmd+Shift+R)
- Verify: cart is empty (should fetch fresh), then fetches and shows correct items
- (No persistence expected, fresh fetch always)

---

## Debugging Commands

```javascript
// Check Redux cart state
localStorage.getItem('persist:root') // if using Redux Persist
// Or in React DevTools Redux extension

// Monitor API calls
// Open Network tab in DevTools
// Filter by "cart" to see all cart API requests

// Check optimisticTimestamp matching
// In Redux state, each cartItem has lastOptimisticTimestamp
// Should match the timestamp from the request that created it

// Verify conflict resolution
// Add console.log in updateCartFromResponse (cart-slice.ts)
// Watch how different timestamps are compared
```

---

## Known Limitations

1. **Cross-Tab Sync**: Not implemented
   - Opening cart in Tab A and Tab B will have separate Redux stores
   - Updates in Tab A don't sync to Tab B
   - *Recommendation*: Implement via localStorage + BroadcastChannel

2. **Offline Support**: Not implemented
   - No service worker caching
   - No queue persistence if app closed
   - *Recommendation*: Use redux-persist + idb (IndexedDB)

3. **Retry Mechanism**: Limited
   - Only backend retry (OptimisticLockException)
   - No frontend exponential backoff for network errors
   - *Recommendation*: Add retry logic in thunk wrapper

---

## Performance Benchmarks

**Target metrics**:
- Add to cart latency: < 100ms (optimistic UI)
- API response time: 200-500ms typical
- Debounce effectiveness: Rapid clicks (10x) = 1 API call

**Monitoring**:
1. Open DevTools Performance tab
2. Click "+" rapidly for 2 seconds
3. Check:
   - [ ] One API request fires
   - [ ] UI updates are instant (<16ms frame time)
   - [ ] Memory stable (no leaks)

---

## Summary

All flows should:
1. ✅ Optimistically update Redux immediately (instant UI feedback)
2. ✅ Debounce API calls (500ms, serialize per item)
3. ✅ Conflict resolve (newer timestamps win)
4. ✅ Handle network errors gracefully
5. ✅ Sync across pages via Redux
6. ✅ Protect against stale/unavailable products

**Branch**: `claude/fix-cart-state-sync-GvTPW`
**Files Modified**:
- `src/components/shared/card/product-card.tsx` (fixed add-to-cart logic)
- `src/hooks/use-cart-debounce.ts` (improved documentation)
- `src/redux/features/main/store/slice/cart-slice.ts` (fixed timestamp initialization)
