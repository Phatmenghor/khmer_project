# Business Settings Frontend Implementation Guide

## Quick Start

### 1. Initialize Business Settings Cache at App Root

```typescript
// src/app/layout.tsx or src/App.tsx
import { useBusinessSettingsCache } from "@/hooks/use-business-settings-cache";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const businessId = useAppSelector(selectCurrentBusinessId);

  // Initialize cache on app load
  const { settings } = useBusinessSettingsCache({
    businessId,
    cacheDurationMs: 3600000, // 1 hour
    onSettingsUpdate: (newSettings) => {
      console.log("Business settings updated:", newSettings);
      // Dispatch Redux action to update theme/settings in store
      dispatch(updateBusinessSettings(newSettings));
    },
  });

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Use in Components

```typescript
// src/components/Footer/BusinessFooter.tsx
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function BusinessFooter() {
  const settings = getBusinessSettingsSync();

  return (
    <footer style={{ backgroundColor: settings.primaryColor }}>
      <div className="container">
        {/* Business Contact Info */}
        <div className="contact-section">
          <h3>{settings.businessName}</h3>
          <p>{settings.contactAddress}</p>
          <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
        </div>

        {/* Business Hours */}
        <div className="hours-section">
          <h4>Business Hours</h4>
          <ul>
            {settings.businessHours?.map((hour) => (
              <li key={hour.day}>
                <strong>{formatDay(hour.day)}:</strong>
                {hour.openingTime && hour.closingTime ? (
                  <span>
                    {hour.openingTime} - {hour.closingTime}
                  </span>
                ) : (
                  <span className="closed">Closed</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media Links */}
        <div className="social-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            {settings.socialMedia?.map((social) => (
              <a
                key={social.name}
                href={social.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-icon ${social.name.toLowerCase()}`}
                title={social.name}
              >
                <i className={`fab fa-${getSocialIcon(social.name)}`} />
              </a>
            ))}
          </div>
        </div>

        {/* Tax Info */}
        {settings.taxPercentage && (
          <div className="tax-section">
            <p>Tax: {settings.taxPercentage}%</p>
          </div>
        )}
      </div>
    </footer>
  );
}

function formatDay(day: string): string {
  const days = {
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
  };
  return days[day as keyof typeof days] || day;
}

function getSocialIcon(platform: string): string {
  const icons: Record<string, string> = {
    facebook: "facebook",
    instagram: "instagram",
    tiktok: "tiktok",
    twitter: "twitter",
    youtube: "youtube",
    linkedin: "linkedin",
    pinterest: "pinterest",
    telegram: "telegram",
  };
  return icons[platform.toLowerCase()] || "link";
}
```

### 3. Apply Theme from Business Settings

```typescript
// src/utils/theme/apply-business-theme.ts
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function applyBusinessTheme(): void {
  const settings = getBusinessSettingsSync();

  const root = document.documentElement;

  // Apply color scheme
  root.style.setProperty("--primary-color", settings.primaryColor || "#FF6B6B");
  root.style.setProperty(
    "--secondary-color",
    settings.secondaryColor || "#F0F0F0"
  );
  root.style.setProperty("--accent-color", settings.accentColor || "#FFA500");

  // Apply logo
  if (settings.logoBusinessUrl) {
    const logoElement = document.querySelector('img[data-logo="business"]');
    if (logoElement) {
      (logoElement as HTMLImageElement).src = settings.logoBusinessUrl;
    }
  }

  // Apply business name
  if (settings.businessName) {
    document.title = `${settings.businessName} - Menu`;
  }
}

// Call on app init
export function initializeTheme(): void {
  applyBusinessTheme();

  // Reapply when settings update
  const { settings: initialSettings } = useBusinessSettingsCache({
    onSettingsUpdate: () => {
      applyBusinessTheme();
    },
  });
}
```

### 4. Contact Information Component

```typescript
// src/components/Contact/BusinessContact.tsx
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function BusinessContact() {
  const settings = getBusinessSettingsSync();

  return (
    <section className="business-contact">
      <h2>Contact Us</h2>

      <div className="contact-grid">
        {settings.contactAddress && (
          <div className="contact-item">
            <i className="icon-location" />
            <div>
              <h4>Address</h4>
              <p>{settings.contactAddress}</p>
            </div>
          </div>
        )}

        {settings.contactPhone && (
          <div className="contact-item">
            <i className="icon-phone" />
            <div>
              <h4>Phone</h4>
              <a href={`tel:${settings.contactPhone}`}>
                {settings.contactPhone}
              </a>
            </div>
          </div>
        )}

        {settings.contactEmail && (
          <div className="contact-item">
            <i className="icon-email" />
            <div>
              <h4>Email</h4>
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

### 5. Business Logo Component

```typescript
// src/components/Logo/BusinessLogo.tsx
import Image from "next/image";
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function BusinessLogo() {
  const settings = getBusinessSettingsSync();

  return (
    <div className="logo-container">
      {settings.logoBusinessUrl ? (
        <Image
          src={settings.logoBusinessUrl}
          alt={settings.businessName || "Business Logo"}
          width={200}
          height={100}
          priority
          onError={(e) => {
            // Fallback to text if image fails
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="logo-placeholder">
          <h1>{settings.businessName}</h1>
        </div>
      )}
    </div>
  );
}
```

### 6. Tax Calculator (Using Business Tax)

```typescript
// src/utils/pricing/calculate-tax.ts
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function calculateTax(amount: number): number {
  const settings = getBusinessSettingsSync();
  const taxRate = settings.taxPercentage || 0;
  return (amount * taxRate) / 100;
}

export function calculateTotalWithTax(amount: number): number {
  return amount + calculateTax(amount);
}

// Usage in component
export function PriceDisplay({ price }: { price: number }) {
  const tax = calculateTax(price);
  const total = calculateTotalWithTax(price);

  return (
    <div className="price-breakdown">
      <p>Subtotal: ${price.toFixed(2)}</p>
      <p>Tax: ${tax.toFixed(2)}</p>
      <p className="total">Total: ${total.toFixed(2)}</p>
    </div>
  );
}
```

---

## Integration Examples

### Header with Theme Colors

```typescript
// src/components/Header/Header.tsx
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function Header() {
  const settings = getBusinessSettingsSync();

  return (
    <header
      style={{
        backgroundColor: settings.primaryColor || "#FF6B6B",
        color: settings.textColor || "#FFFFFF",
      }}
    >
      <nav className="navbar">
        <div className="navbar-brand">
          <img
            src={settings.logoBusinessUrl || "/default-logo.png"}
            alt={settings.businessName || "Logo"}
            className="navbar-logo"
          />
          <span className="business-name">{settings.businessName}</span>
        </div>
        <ul className="nav-links">
          <li>
            <a href="/menu">Menu</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
          <li>
            <a href="/orders">Orders</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

### Open Status Display

```typescript
// src/components/OpenStatus/OpenStatus.tsx
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function OpenStatus() {
  const settings = getBusinessSettingsSync();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkIfOpen = () => {
      const now = new Date();
      const day = getDayName(now.getDay());
      const time = formatTime(now);

      const todayHours = settings.businessHours?.find((h) => h.day === day);

      if (!todayHours || !todayHours.openingTime || !todayHours.closingTime) {
        setIsOpen(false);
        return;
      }

      const open = time >= todayHours.openingTime && time <= todayHours.closingTime;
      setIsOpen(open);
    };

    checkIfOpen();
    const interval = setInterval(checkIfOpen, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [settings.businessHours]);

  return (
    <div className={`status-badge ${isOpen ? "open" : "closed"}`}>
      <span className="status-dot" />
      <span className="status-text">{isOpen ? "Open" : "Closed"}</span>
    </div>
  );
}

function getDayName(dayIndex: number): string {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[dayIndex];
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5); // HH:MM
}
```

### Admin Business Settings Editor

```typescript
// src/app/admin/business-settings/BusinessSettingsForm.tsx
import { useForm } from "react-hook-form";
import { getBusinessSettingsSync } from "@/hooks/use-business-settings-cache";

export function BusinessSettingsForm() {
  const currentSettings = getBusinessSettingsSync();
  const { register, handleSubmit, watch } = useForm({
    defaultValues: currentSettings,
  });

  const onSubmit = async (data: BusinessSettingsResponse) => {
    const response = await fetch(
      `/api/v1/business-settings/business/${currentSettings.businessId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      // Clear cache to force refresh
      clearBusinessSettingsCache();
      // Refresh page or update local state
      window.location.reload();
    }
  };

  const primaryColor = watch("primaryColor");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <legend>Business Information</legend>

        <input {...register("businessName")} type="text" placeholder="Name" />

        <input
          {...register("contactPhone")}
          type="tel"
          placeholder="Phone"
        />

        <input
          {...register("contactEmail")}
          type="email"
          placeholder="Email"
        />

        <textarea
          {...register("contactAddress")}
          placeholder="Address"
        ></textarea>
      </fieldset>

      <fieldset>
        <legend>Branding</legend>

        <div className="color-picker">
          <label>Primary Color</label>
          <div className="color-preview" style={{ backgroundColor: primaryColor }} />
          <input
            {...register("primaryColor")}
            type="color"
            defaultValue={currentSettings.primaryColor || "#FF6B6B"}
          />
        </div>

        <input
          {...register("logoBusinessUrl")}
          type="url"
          placeholder="Logo URL"
        />
      </fieldset>

      <fieldset>
        <legend>Billing</legend>
        <input
          {...register("taxPercentage")}
          type="number"
          placeholder="Tax %"
          step="0.01"
        />
      </fieldset>

      <button type="submit">Save Settings</button>
    </form>
  );
}
```

---

## Error Handling

### Graceful Degradation

```typescript
// Always have defaults available
function SafeBusinessComponent() {
  const settings = getBusinessSettingsSync();

  const businessName = settings.businessName ?? "Our Business";
  const primaryColor = settings.primaryColor ?? "#FF6B6B";
  const phone = settings.contactPhone ?? "Not available";

  return (
    <div>
      <h1>{businessName}</h1>
      <button style={{ backgroundColor: primaryColor }}>Shop Now</button>
      <p>Call: {phone}</p>
    </div>
  );
}
```

### Handling Missing Social Media

```typescript
function SocialMediaLinks() {
  const settings = getBusinessSettingsSync();

  if (!settings.socialMedia || settings.socialMedia.length === 0) {
    return <p>Follow us on social media</p>;
  }

  return (
    <div className="social-links">
      {settings.socialMedia.map((social) => (
        <a key={social.name} href={social.linkUrl} target="_blank">
          {social.name}
        </a>
      ))}
    </div>
  );
}
```

### Handling Missing Business Hours

```typescript
function BusinessHoursDisplay() {
  const settings = getBusinessSettingsSync();

  if (!settings.businessHours || settings.businessHours.length === 0) {
    return <p>Contact us for business hours</p>;
  }

  return (
    <table>
      <tbody>
        {settings.businessHours.map((hour) => (
          <tr key={hour.day}>
            <td>{formatDay(hour.day)}</td>
            <td>
              {hour.openingTime && hour.closingTime
                ? `${hour.openingTime} - ${hour.closingTime}`
                : "Closed"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Testing

### Unit Test Example

```typescript
// src/__tests__/hooks/useBusinessSettingsCache.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useBusinessSettingsCache } from "@/hooks/use-business-settings-cache";

describe("useBusinessSettingsCache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should load settings from cache", () => {
    const mockSettings = {
      businessName: "Test Store",
      primaryColor: "#FF0000",
      businessHours: [],
      socialMedia: [],
    };

    localStorage.setItem(
      "business_settings_cache",
      JSON.stringify({
        data: mockSettings,
        hash: "abc123",
        timestamp: Date.now(),
      })
    );

    const { result } = renderHook(() => useBusinessSettingsCache());

    expect(result.current.settings.businessName).toBe("Test Store");
  });

  it("should handle missing cache gracefully", () => {
    const { result } = renderHook(() => useBusinessSettingsCache());

    expect(result.current.settings).toBeDefined();
    expect(result.current.error).toBeNull();
  });
});
```

---

## Performance Tips

1. **Lazy Load Social Media Icons**
   ```typescript
   import dynamic from "next/dynamic";

   const SocialMediaLinks = dynamic(() =>
     import("@/components/SocialMediaLinks").then((mod) => mod.SocialMediaLinks)
   );
   ```

2. **Memoize Business Settings**
   ```typescript
   const MemoizedFooter = memo(BusinessFooter);
   ```

3. **Use Suspense for Async Data**
   ```typescript
   <Suspense fallback={<div>Loading...</div>}>
     <BusinessFooter />
   </Suspense>
   ```

---

## Conclusion

This implementation provides:
- ✅ Instant UI rendering with cached settings
- ✅ Hourly verification for freshness
- ✅ Graceful fallbacks and error handling
- ✅ Easy integration with components
- ✅ Flexible caching strategies
- ✅ Comprehensive customization

All business display elements (header, footer, contact info, theme colors) are now driven by cached business settings with intelligent updates.
