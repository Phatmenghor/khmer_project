# Business Settings Caching Strategy

## Overview
This document describes the optimal caching strategy for business settings in the frontend application. The strategy uses a **smart verification approach** that minimizes API calls while ensuring settings are always current.

---

## Architecture

### Caching Layers
```
┌─────────────────────────────────────┐
│   React Component                   │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   useBusinessSettingsCache Hook     │
│   (Manages initialization & flow)   │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       ↓                ↓
   ┌──────────┐    ┌──────────────┐
   │LocalStor │    │API Service   │
   │(L1 Cache)│    │(L2 - Network)│
   └──────────┘    └──────────────┘
       │                ↓
       └──→ Hash-based change detection
```

---

## Initialization Flow (On App Start)

### Step 1: Load from LocalStorage (Instant - ~1ms)
```javascript
const cached = businessSettingsStorage.getCached();
// Returns: { data, hash, timestamp }
```
- **Instant access** - no network delay
- **Always available** - even offline
- Used immediately to render UI with current colors, logos, etc.

### Step 2: Verify Cache Validity (Check Timestamp)
```javascript
const isCacheValid = businessSettingsStorage.isCacheValid(cacheDurationMs);
// Default: 1 hour (3600000ms)
```
- If cache is **fresh** (< 1 hour old) → Skip API call
- If cache is **stale** (> 1 hour old) → Fetch from API

### Step 3: API Verification (If Cache is Stale)
```javascript
if (!isCacheValid) {
  const freshSettings = await fetchBusinessSettingsByBusinessId(businessId);
  const newHash = generateBusinessSettingsHash(freshSettings);
  const storedHash = businessSettingsStorage.getStoredHash();
  
  if (newHash !== storedHash) {
    // Settings changed - update cache & UI
    businessSettingsStorage.setCached(freshSettings, newHash);
    onSettingsUpdate?.(freshSettings);
  } else {
    // No changes - keep existing cache (timestamp already renewed)
    console.log("✓ No changes in business settings");
  }
}
```

### Step 4: Fallback Strategy (On Error)
```javascript
catch (error) {
  // API call failed - keep using cached/default settings
  if (!cached?.data) {
    console.log("Using default settings due to API error");
    // Use built-in defaults from business-settings-default.json
  }
  // Settings remain available - app still works
}
```

---

## Benefits of This Strategy

### 1. **Performance**
- ✅ Instant UI rendering (from localStorage)
- ✅ Minimal API calls (only hourly verification)
- ✅ Reduced server load
- ✅ Works offline with cached data

### 2. **Data Freshness**
- ✅ Hourly verification ensures updates within 1 hour
- ✅ Hash-based comparison prevents redundant updates
- ✅ Intelligent skip of unchanged data

### 3. **Reliability**
- ✅ Fallback to cached data on API failure
- ✅ Default settings available as safety net
- ✅ No broken UI even when API is down

### 4. **Network Efficiency**
- ✅ Only sends updated data when changed
- ✅ Avoids re-rendering when nothing changed
- ✅ Reduces bandwidth usage

---

## Implementation Guide

### 1. Hook Usage (React Components)
```typescript
// In your component
const { settings, isLoading, error } = useBusinessSettingsCache({
  businessId: "550cad56-cafd-4aba-baef-c4dcd53940d0",
  cacheDurationMs: 3600000, // 1 hour (default)
  onSettingsUpdate: (newSettings) => {
    console.log("Settings updated:", newSettings);
    // Trigger theme refresh, logo update, etc.
  },
});

// Use settings immediately (from cache or defaults)
const primaryColor = settings.primaryColor || "#FF6B6B";
const logo = settings.logoBusinessUrl;
```

### 2. Sync Access (Outside React)
```typescript
// For use outside React components (utilities, services)
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

const settings = getBusinessSettingsSync();
const theme = applyTheme(settings.primaryColor);
```

### 3. Manual Cache Refresh
```typescript
// Clear cache and force refresh
import { clearBusinessSettingsCache } from "@/hooks/use-business-settings-cache";

// On logout or business switch
clearBusinessSettingsCache();
```

---

## Cache Invalidation

### Automatic Invalidation (After 1 Hour)
- Timestamp check every initialization
- Configurable via `cacheDurationMs` parameter

### Manual Invalidation (On Events)
```typescript
// On user logout
clearBusinessSettingsCache();

// On business switch
clearBusinessSettingsCache();
// Then re-initialize with new businessId

// Force refresh (don't wait for 1-hour timeout)
clearBusinessSettingsCache();
const freshSettings = await fetchBusinessSettingsByBusinessId(businessId);
```

---

## Data Structure

### Business Settings Response
```json
{
  "status": "success",
  "message": "Business setting retrieved",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "createdAt": "2026-04-30T12:54:13.992454",
    "updatedAt": "2026-04-30T12:54:13.992454",
    "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
    "businessName": "Mega Store",
    "taxPercentage": 10,
    "logoBusinessUrl": "https://...",
    "primaryColor": "#FF6B6B",
    "contactAddress": "Phnom Penh, Cambodia",
    "contactPhone": "+855-12-345-678",
    "contactEmail": "megastore@example.com",
    
    "socialMedia": [
      { "name": "Facebook", "linkUrl": "https://facebook.com/megastore" },
      { "name": "Instagram", "linkUrl": "https://instagram.com/megastore" },
      { "name": "TikTok", "linkUrl": "https://tiktok.com/@megastore" }
    ],
    
    "businessHours": [
      { "day": "MONDAY", "openingTime": "08:00", "closingTime": "20:00" },
      { "day": "TUESDAY", "openingTime": "08:00", "closingTime": "20:00" },
      { "day": "WEDNESDAY", "openingTime": "08:00", "closingTime": "20:00" },
      { "day": "THURSDAY", "openingTime": "08:00", "closingTime": "20:00" },
      { "day": "FRIDAY", "openingTime": "08:00", "closingTime": "21:00" },
      { "day": "SATURDAY", "openingTime": "09:00", "closingTime": "21:00" },
      { "day": "SUNDAY", "openingTime": "10:00", "closingTime": "18:00" }
    ],
    
    "useCategories": true,
    "useSubcategories": true,
    "useBrands": true
  }
}
```

---

## Storage Keys (LocalStorage)

```
Key: "business_settings_cache"
Value: {
  "data": { /* BusinessSettingsResponse */ },
  "hash": "a1b2c3d4", // For change detection
  "timestamp": 1704067200000 // When cached
}
```

---

## Hash Function

The hash is computed from these critical fields only:
- `id`
- `primaryColor`, `secondaryColor`, `accentColor`, etc.
- `logoBusinessUrl`, `coverBusinessUrl`
- `businessName`
- `taxPercentage`
- `deliveryFeeDefault`
- `updatedAt` (timestamp from server)

This ensures UI-relevant changes trigger updates while data-only changes don't.

---

## Configuration

### Cache Duration
```typescript
// Short cache (5 minutes) - for frequently changing settings
cacheDurationMs: 300000

// Default cache (1 hour) - recommended
cacheDurationMs: 3600000

// Long cache (24 hours) - for stable businesses
cacheDurationMs: 86400000
```

### Default Settings Fallback
Located at: `/src/constants/defaults/business-settings-default.json`

```json
{
  "businessName": "My Business",
  "primaryColor": "#FF6B6B",
  "contactPhone": "+1-555-0000",
  "taxPercentage": 0,
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false,
  "socialMedia": [],
  "businessHours": []
}
```

---

## API Endpoints

### Fetch Business Settings
```
GET /api/v1/business-settings/business/{businessId}

Headers:
  Content-Type: application/json

Response:
  200 OK - Settings retrieved and cached
  404 NOT FOUND - Business not found
  401 UNAUTHORIZED - Invalid token
  500 SERVER ERROR - Server issue
```

---

## Performance Metrics

| Scenario | Time | Network Call |
|----------|------|--------------|
| **Fresh load (cache exists)** | ~1ms | ❌ No |
| **Fresh load (cache stale, no changes)** | ~50-200ms | ✅ 1 API call |
| **Fresh load (cache stale, has changes)** | ~50-200ms | ✅ 1 API call + update |
| **Offline with cache** | ~1ms | ❌ No |
| **First time ever** | ~50-200ms | ✅ 1 API call |
| **After logout** | ~1ms | ❌ No (uses defaults) |

---

## Debugging

### Check Cache Status
```javascript
// In browser console
const cached = businessSettingsStorage.getCached();
console.log("Cached settings:", cached);
console.log("Cache age (ms):", Date.now() - cached.timestamp);
console.log("Is valid:", businessSettingsStorage.isCacheValid(3600000));
```

### Clear Cache (Development)
```javascript
businessSettingsStorage.clearCache();
console.log("Cache cleared. Refresh page to reload.");
```

### View Logs
```javascript
// The hook logs all state changes:
// ✅ Business settings loaded from cache
// 📋 Using default business settings
// 🔄 Business settings updated from API
// ✓ No changes in business settings
// ⚠️ Failed to fetch business settings from API
```

---

## Best Practices

1. **Initialize once per user login**
   - Call `useBusinessSettingsCache` at app root or user context
   - Don't reinitialize on every page navigation

2. **Use sync getter for non-component code**
   - Use `getBusinessSettingsSync()` in services/utilities
   - Use hook in React components

3. **Handle errors gracefully**
   - Always have defaults available
   - Show fallback UI if settings unavailable

4. **Cache on logout**
   - Clear cache when user logs out
   - Prevents showing previous business settings to new user

5. **Monitor cache metrics**
   - Track cache hit/miss rates
   - Adjust duration based on update frequency

---

## Future Enhancements

1. **WebSocket Updates**
   - Real-time settings push without polling
   - Instant updates across tabs

2. **Partial Cache Invalidation**
   - Only invalidate changed fields
   - Keep unchanged data

3. **Multi-business Support**
   - Separate cache per business
   - Quick switching between businesses

4. **Analytics Integration**
   - Track cache effectiveness
   - Optimize duration based on data

---

## Troubleshooting

### Issue: Settings not updating after API change
**Solution:** Wait 1 hour or clear cache manually
```javascript
businessSettingsStorage.clearCache();
```

### Issue: Old settings visible after logout
**Solution:** Clear cache on logout
```javascript
logout() {
  clearBusinessSettingsCache();
  redirectToLogin();
}
```

### Issue: Slow initial load
**Solution:** Increase cache duration or use faster CDN for assets

### Issue: Settings lost on page refresh
**Solution:** Check if localStorage is disabled in browser

---

## Conclusion

This caching strategy provides:
- **Fast performance** through localStorage
- **Data freshness** through hourly API verification
- **Reliability** through intelligent fallbacks
- **Efficiency** through hash-based change detection

The result is a responsive UI that always shows current business settings with minimal server load.
