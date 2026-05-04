# Business Settings - Quick Reference Guide

## 📋 Overview

Business Settings are cached locally with smart API verification to ensure data freshness while minimizing server load.

**Key Principle:** Load from cache → Verify with API (hourly) → Update if changed → Use defaults as fallback

---

## 🚀 Quick Integration (5 minutes)

### 1. Initialize in App Root
```typescript
const { settings } = useBusinessSettingsCache({
  businessId: yourBusinessId,
  cacheDurationMs: 3600000, // 1 hour
});
```

### 2. Use in Components
```typescript
// Anywhere in your component
const settings = getBusinessSettingsSync();
const color = settings.primaryColor || "#FF6B6B";
```

### 3. Display in Footer
```typescript
<footer>
  <h3>{settings.businessName}</h3>
  <p>{settings.contactPhone}</p>
  <p>{settings.contactAddress}</p>
  
  {settings.businessHours?.map(hour => (
    <p key={hour.day}>{hour.day}: {hour.openingTime} - {hour.closingTime}</p>
  ))}
  
  {settings.socialMedia?.map(social => (
    <a key={social.name} href={social.linkUrl}>{social.name}</a>
  ))}
</footer>
```

---

## 🔄 Cache Flow

```
App Start
   ↓
Load from localStorage (instant)
   ↓
Is cache < 1 hour old?
   ├─ YES → Use cached data ✅ (no API call)
   └─ NO → Fetch from API
            ↓
          Has data changed?
          ├─ YES → Update cache & UI 🔄
          └─ NO → Keep cached data ✅
```

---

## 📊 API Response Structure

```json
{
  "status": "success",
  "data": {
    "id": "...",
    "businessId": "...",
    "businessName": "Mega Store",
    "primaryColor": "#FF6B6B",
    "logoBusinessUrl": "https://...",
    "taxPercentage": 10,
    "contactAddress": "Phnom Penh",
    "contactPhone": "+855-12-345-678",
    "contactEmail": "info@megastore.com",
    
    "socialMedia": [
      { "name": "Facebook", "linkUrl": "https://facebook.com/..." },
      { "name": "Instagram", "linkUrl": "https://instagram.com/..." }
    ],
    
    "businessHours": [
      { "day": "MONDAY", "openingTime": "08:00", "closingTime": "20:00" },
      { "day": "SUNDAY", "openingTime": null, "closingTime": null }
    ],
    
    "useCategories": true,
    "useSubcategories": true,
    "useBrands": true
  }
}
```

---

## 💾 LocalStorage Structure

```javascript
// Key: "business_settings_cache"
{
  data: { /* entire BusinessSettingsResponse */ },
  hash: "a1b2c3d4", // For change detection
  timestamp: 1704067200000 // Milliseconds since epoch
}
```

---

## 🎨 Common Use Cases

### Apply Primary Color to Button
```typescript
<button style={{ backgroundColor: settings.primaryColor }}>
  Shop Now
</button>
```

### Display Logo
```typescript
<img src={settings.logoBusinessUrl} alt={settings.businessName} />
```

### Show Business Hours
```typescript
{settings.businessHours?.map(hour => (
  <div key={hour.day}>
    <strong>{hour.day}</strong>
    <span>
      {hour.openingTime && hour.closingTime 
        ? `${hour.openingTime} - ${hour.closingTime}`
        : 'Closed'
      }
    </span>
  </div>
))}
```

### Social Media Links
```typescript
{settings.socialMedia?.map(social => (
  <a key={social.name} href={social.linkUrl} target="_blank">
    {social.name}
  </a>
))}
```

### Calculate Tax
```typescript
function getTotalPrice(price: number): number {
  const tax = (price * settings.taxPercentage) / 100;
  return price + tax;
}
```

---

## 🔧 Configuration Options

```typescript
interface UseBusinessSettingsCacheOptions {
  businessId?: string;              // UUID of the business
  cacheDurationMs?: number;          // Default: 3600000 (1 hour)
  onSettingsUpdate?: (settings) => void; // Called when settings update
}
```

### Examples

```typescript
// Short cache (5 minutes)
useBusinessSettingsCache({
  businessId,
  cacheDurationMs: 300000,
});

// Long cache (24 hours)
useBusinessSettingsCache({
  businessId,
  cacheDurationMs: 86400000,
});

// With update callback
useBusinessSettingsCache({
  businessId,
  onSettingsUpdate: (newSettings) => {
    console.log("Settings updated:", newSettings);
    // Update theme, dispatch Redux action, etc.
  },
});
```

---

## 🚨 Error Handling

### Always Use Defaults
```typescript
const settings = getBusinessSettingsSync();
const name = settings.businessName ?? "My Business";
const color = settings.primaryColor ?? "#FF6B6B";
const tax = settings.taxPercentage ?? 0;
```

### Handle Missing Arrays
```typescript
// Safe iteration
settings.socialMedia?.map(item => ...) // Returns undefined if null
settings.businessHours?.forEach(hour => ...) // Safe forEach

// Safe length check
const hasHours = (settings.businessHours?.length ?? 0) > 0;
```

### Fallback on Error
```typescript
try {
  const settings = getBusinessSettingsSync();
  // Use settings
} catch (error) {
  // Use defaults from business-settings-default.json
  console.log("Using default settings");
}
```

---

## 🔄 Manual Cache Control

### Clear Cache (on logout)
```typescript
import { clearBusinessSettingsCache } from "@/hooks/use-business-settings-cache";

clearBusinessSettingsCache();
```

### Force Refresh
```typescript
clearBusinessSettingsCache();
// Then reinitialize with new businessId
const { settings } = useBusinessSettingsCache({ businessId });
```

### Check Cache Status
```typescript
// In browser console
const cached = businessSettingsStorage.getCached();
console.log("Cached:", cached);
console.log("Age:", Date.now() - cached.timestamp, "ms");
console.log("Valid?", businessSettingsStorage.isCacheValid(3600000));
```

---

## 📍 Where to Use

### ✅ Use Sync Version Outside React
```typescript
// In utils, services, helpers
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function calculatePrice(amount: number): number {
  const settings = getBusinessSettingsSync();
  return amount * (1 + settings.taxPercentage / 100);
}
```

### ✅ Use Hook in React Components
```typescript
// In React components
const { settings } = useBusinessSettingsCache({
  businessId: userId,
});

return <div style={{ color: settings.primaryColor }}>...</div>;
```

### ✅ Initialize Once at App Root
```typescript
// In layout.tsx or App.tsx
const { settings } = useBusinessSettingsCache({
  businessId,
  onSettingsUpdate: (newSettings) => {
    // Update Redux or Context
  },
});
```

---

## 📈 Performance Impact

| Operation | Time | Impact |
|-----------|------|--------|
| Load from cache | ~1ms | ✅ Instant |
| API call (hourly) | ~50-200ms | ✅ Background |
| Hash comparison | <1ms | ✅ Negligible |
| Theme application | ~5ms | ✅ Minor |
| **Total first load** | ~1ms | ✅ Very fast |
| **Subsequent loads** | ~1ms | ✅ Instant |

---

## 🐛 Debugging Checklist

- [ ] Is `businessId` being passed correctly?
- [ ] Does API endpoint exist and return data?
- [ ] Is localStorage enabled in browser?
- [ ] Are business hours using correct day names (MONDAY, TUESDAY, etc.)?
- [ ] Are social media URLs valid and reachable?
- [ ] Is logo URL valid and accessible?
- [ ] Are default settings fallback available?
- [ ] Is cache clearing called on logout?

---

## 🌍 Internationalization

Day names from API:
```
MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
```

Translate in component:
```typescript
const dayNames = {
  MONDAY: 'Monday' or 'ច័ន្ទ',
  TUESDAY: 'Tuesday' or 'អង្គារ',
  // ...
};

const displayDay = dayNames[hour.day];
```

---

## 📞 Support

### Test Data Location
```
/menu-scanner-backend/scripts/comprehensive-test-data.sql
```

### Documentation Files
- `BUSINESS_SETTINGS_CACHING_STRATEGY.md` - Full architecture
- `BUSINESS_SETTINGS_FRONTEND_IMPLEMENTATION.md` - Implementation examples
- `BUSINESS_SETTINGS_QUICK_REFERENCE.md` - This file

### Sample API Response
```
GET /api/v1/business-settings/business/550cad56-cafd-4aba-baef-c4dcd53940d0
```

Returns business settings with social media and business hours arrays fully populated.

---

## 🎯 Next Steps

1. ✅ Read `BUSINESS_SETTINGS_CACHING_STRATEGY.md` for full architecture
2. ✅ Check `BUSINESS_SETTINGS_FRONTEND_IMPLEMENTATION.md` for code examples
3. ✅ Implement `useBusinessSettingsCache` hook in your app root
4. ✅ Use `getBusinessSettingsSync()` in components and utilities
5. ✅ Test with sample data from `comprehensive-test-data.sql`
6. ✅ Monitor cache hits and performance

---

## 🔗 Related Files

```
Frontend:
├─ src/hooks/use-business-settings-cache.ts
├─ src/utils/storage/business-settings-storage.ts
├─ src/redux/features/business/store/services/business-settings-api.ts
├─ src/constants/defaults/business-settings-default.json
└─ src/constants/business-settings.ts

Backend:
├─ src/main/java/.../models/BusinessSetting.java
├─ src/main/java/.../models/SocialMedia.java
├─ src/main/java/.../models/BusinessHours.java
├─ src/main/java/.../controller/PublicBusinessSettingController.java
└─ scripts/comprehensive-test-data.sql
```

---

**Last Updated:** April 30, 2026
**Cache Duration:** 1 hour (configurable)
**API Endpoint:** `GET /api/v1/business-settings/business/{businessId}`
**Storage:** LocalStorage (business_settings_cache)
