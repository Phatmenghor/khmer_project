# Stock Management Implementation - Testing Guide

## Overview
This guide explains the stock management feature that automatically deducts stock when orders are confirmed or completed, but only if **Stock Management is enabled** in business settings.

---

## Feature Summary

### When Stock is Deducted:
1. **Admin Order Update (POS or Customer Orders)**:
   - When an order status changes to `CONFIRMED` or `COMPLETED`
   - Stock Management must be **ENABLED** in business settings
   - Order must have items with quantities

2. **Automatic Checks**:
   - Only deducts if status is **transitioning** (e.g., PENDING → CONFIRMED)
   - Won't deduct if already CONFIRMED and changed to COMPLETED  (first transition only)
   - Gracefully handles errors with warnings instead of blocking

### User-Friendly Messages:
- ✅ **Success**: "Order updated and stock deducted! [message from backend]"
- ⚠️ **Warning**: "Order updated, but stock deduction had issues: [error details]"
- ✅ **Info**: "Order updated successfully!" (if stock management disabled)

---

## Prerequisites Setup

### 1. Enable Stock Management in Business Settings
```
Path: /admin/manage-business-settings (or wherever business settings are configured)
Setting: "Stock Management" → Set to "ENABLED"
```

### 2. Create Test Products with Stock
```
- Create at least 3 products
- Set quantities in stock for each product:
  Product A: 100 units
  Product B: 50 units
  Product C: 25 units
```

### 3. Create Test Orders
```
- At least 2 orders should be created with various items
- Note the order IDs for testing
```

---

## Step-by-Step Testing

### Test Case 1: Admin Updates POS Order to CONFIRMED

**Setup:**
1. Go to Admin → Orders Management (`/admin/orders`)
2. Find a POS order (you can create one at `/admin/pos`)
3. Create a test POS order with:
   - Item 1: Product A, Qty 5
   - Item 2: Product B, Qty 3

**Execution:**
1. Click the order row to open detail modal
2. Click "Edit" button in the order detail modal
3. Change order status from `PENDING` to `CONFIRMED`
4. Keep other fields as-is (Payment Method, Payment Status)
5. Click "Update Order"

**Expected Result:**
```
✅ Toast Message: "Order updated and stock deducted! [number] items deducted"
✅ Stock for Product A reduced by 5 units
✅ Stock for Product B reduced by 3 units
✅ Modal closes and order list refreshes
```

**Verification:**
1. Open Products inventory page
2. Check Product A: Should be 95 units (100 - 5)
3. Check Product B: Should be 47 units (50 - 3)

---

### Test Case 2: Admin Updates Customer Order to CONFIRMED

**Setup:**
1. Go to Admin → Orders Management
2. Find a customer order (Orders with `orderFrom: "CUSTOMER"`)
3. Alternatively, create a customer order:
   - Go to `/checkout` (as customer)
   - Complete order with items
   - Go back to Admin Orders to find it

**Execution:**
1. Select the customer order
2. Click "Edit" button
3. Change status to `CONFIRMED`
4. Click "Update Order"

**Expected Result:**
- Same as Test Case 1 - Stock deducted with confirmation message

---

### Test Case 3: Admin Updates Order to COMPLETED

**Setup:**
1. Find an order that's currently in `CONFIRMED` status
2. (From Test Case 1 or 2 previous order)

**Execution:**
1. Click the order to edit
2. Change status from `CONFIRMED` to `COMPLETED`
3. Click "Update Order"

**Expected Result:**
```
✅ Toast Message: "Order updated and stock deducted! [number] items deducted"
✅ Stock deducted again for COMPLETED status
```

**Note:** Stock deducts for EACH transition (PENDING→CONFIRMED AND CONFIRMED→COMPLETED)

---

### Test Case 4: Stock Management DISABLED

**Setup:**
1. Go to Business Settings
2. Set Stock Management to **DISABLED**
3. Find an order with PENDING status

**Execution:**
1. Edit the order
2. Change status to `CONFIRMED`
3. Click "Update Order"

**Expected Result:**
```
✅ Toast Message: "Order updated successfully!"
❌ NO stock deduction occurs
✅ No additional messages about stock
```

**Verification:**
1. Check product stocks - they should remain unchanged

---

### Test Case 5: Stock Deduction Error Handling

**Setup:**
1. Stock Management ENABLED
2. Create an order with invalid product ID (if possible) or trigger API error

**Execution:**
1. Try to update order status with bad data

**Expected Result:**
```
⚠️ Toast Message: "Order updated, but stock deduction had issues: [error message]"
✅ Order still updates successfully
⚠️ Stock deduction fails gracefully without blocking order update
```

---

### Test Case 6: Multiple Orders Stock Consistency

**Setup:**
1. Stock Management ENABLED
2. Product A currently has 95 units
3. Create two orders, each with Product A qty 5

**Execution:**
1. Confirm Order 1 (Product A qty 5)
2. Confirm Order 2 (Product A qty 5)

**Expected Result:**
```
Order 1 Confirmation: Product A: 95 → 90 units
Order 2 Confirmation: Product A: 90 → 85 units
Final Stock: 85 units (95 - 5 - 5)
```

---

## API Endpoint Details

### Stock Deduction Endpoint
```
POST /api/v1/inventory/deduct-order-stock

Request Body:
{
  "orderId": "uuid-of-order",
  "items": [
    {
      "productId": "uuid",
      "quantity": 5,
      "productSizeId": "uuid-or-null"
    }
  ],
  "reason": "Order status changed to CONFIRMED"
}

Response:
{
  "success": true,
  "message": "Stock deducted successfully",
  "deductedItems": [
    {
      "productId": "uuid",
      "quantityDeducted": 5,
      "remainingStock": 90
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Order updated, but stock deduction had issues"
**Possible Causes:**
- Product doesn't exist
- Insufficient stock available
- Invalid product ID in order items
- Backend API error

**Solution:**
- Check browser console for detailed error
- Verify product exists in inventory
- Check product has adequate stock
- Review backend logs

### Issue: Stock not deducting
**Possible Causes:**
- Stock Management is DISABLED in business settings
- Order items are empty/null
- API endpoint not responding

**Solution:**
1. Verify Stock Management ENABLED:
   ```
   Business Settings → Stock Management → ENABLED
   ```
2. Check order has items:
   ```
   Open order detail → Verify "Items" section shows products
   ```
3. Check browser network tab for API failures

### Issue: Duplicate Stock Deduction
**Possible Causes:**
- Same order status "change" processed twice
- Client retried request

**Solution:**
- Backend should have idempotency protection
- Frontend already checks for status transition
- Report to backend team if issue persists

---

## Database Verification (For Backend Team)

If you need to verify stock deductions in the database:

```sql
-- Check product stock levels
SELECT id, name, quantity_in_stock FROM products WHERE id = 'product-uuid';

-- Check order stock history (if table exists)
SELECT * FROM stock_deductions WHERE order_id = 'order-uuid';

-- Check order items for audit trail
SELECT * FROM order_items WHERE order_id = 'order-uuid';
```

---

## Quick Checklist for Manual Testing

### Before Testing:
- [ ] Stock Management ENABLED in business settings
- [ ] Test products created with initial stock quantities
- [ ] Test orders created with various items
- [ ] Backend API `/api/v1/inventory/deduct-order-stock` is working

### During Testing:
- [ ] Record initial stock levels
- [ ] Update order status
- [ ] Verify toast message appears
- [ ] Check stock levels after each update
- [ ] Verify order details show correct status

### After Testing:
- [ ] All test cases passed
- [ ] No console errors
- [ ] Stock levels match expected values
- [ ] Messages are clear and user-friendly

---

## Messages Customization

All messages are defined in the Order Update Modal at:
```
src/redux/features/business/components/order-update-modal.tsx
```

Customize messages in the `onSubmit` function:
```typescript
// Success message
showToast.success(`✅ Order updated and stock deducted! ${stockResult.message}`);

// Warning message
showToast.warning(`Order updated, but stock deduction had issues: ${stockError.message}`);
```

---

## Support & Questions

If you encounter issues:
1. Check browser console for detailed errors
2. Check backend logs for API failures
3. Verify business settings are correct
4. Review this guide's Troubleshooting section
5. Contact the development team with:
   - Order ID being updated
   - Expected vs actual stock levels
   - Error message from toast/console
   - Steps to reproduce

---

## Summary

✅ Stock management is now **fully integrated** with order status updates
✅ Only deducts when conditions are met (enabled, confirmed/completed status)
✅ Shows clear, user-friendly messages
✅ Handles errors gracefully
✅ Supports audit trail through order history

Happy testing! 🎉
