# Business Settings Implementation Guide

## Quick Start

### 1. Using Business Settings in Components

```typescript
import { useBusinessSettingsCache } from '@/hooks/use-business-settings-cache'

export function Footer() {
  const { settings } = useBusinessSettingsCache({
    businessId: 'your-business-id'
  })

  return (
    <footer style={{ backgroundColor: settings.primaryColor }}>
      <div>
        <h3>{settings.businessName}</h3>
        <p>{settings.contactAddress}</p>
        <p>{settings.contactPhone}</p>
        <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
      </div>

      {/* Social Media Links */}
      <div className="social-links">
        {settings.socialMedia?.map((social) => (
          <a key={social.name} href={social.linkUrl} title={social.name}>
            <img src={social.imageUrl} alt={social.name} />
          </a>
        ))}
      </div>

      {/* Business Hours */}
      <div className="business-hours">
        <h4>Hours</h4>
        {settings.businessHours?.map((hour) => (
          <div key={hour.day}>
            <span>{hour.day}</span>
            {hour.isClosed ? (
              <span>Closed</span>
            ) : (
              <span>{hour.openTime} - {hour.closeTime}</span>
            )}
          </div>
        ))}
      </div>
    </footer>
  )
}
```

### 2. Using for Colors and Theme

```typescript
import { useBusinessSettingsCache } from '@/hooks/use-business-settings-cache'

export function ThemedComponent() {
  const { settings } = useBusinessSettingsCache()

  return (
    <div
      style={{
        '--primary-color': settings.primaryColor
      } as React.CSSProperties}
    >
      {/* Content */}
    </div>
  )
}
```

### 3. Handling Settings Updates

```typescript
export function SettingsPanel({ businessId }: { businessId: string }) {
  const { settings, isLoading, error } = useBusinessSettingsCache({
    businessId,
    onSettingsUpdate: (newSettings) => {
      // Settings were updated from API
      toast.success('Settings updated from server')
      // Trigger UI updates if needed
    },
    cacheDurationMs: 1800000 // 30 minutes
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <h1 style={{ color: settings.primaryColor }}>
        {settings.businessName}
      </h1>
      <Logo src={settings.logoBusinessUrl} />
      <ContactInfo {...settings} />
    </div>
  )
}
```

## Data Structure Reference

### Complete BusinessSettings Object

```typescript
interface BusinessSettings {
  // IDs and Metadata
  id: string                  // Setting ID (UUID)
  businessId: string          // Business ID (UUID)
  createdAt: string          // ISO 8601 timestamp
  updatedAt: string          // ISO 8601 timestamp
  createdBy: string          // Creator user identifier
  updatedBy: string          // Last updater user identifier

  // Branding & Identity
  businessName: string       // "Mega Store" or "Fashion Hub"
  logoBusinessUrl: string    // Complete URL to logo image
  primaryColor: string       // Hex color: "#FF6B6B"

  // Contact Information
  contactAddress: string     // "Phnom Penh, Cambodia"
  contactPhone: string       // "+855-12-345-678"
  contactEmail: string       // "megastore@example.com"

  // Social Media Links
  socialMedia: SocialMediaLink[]
  
  // Business Hours
  businessHours: BusinessHour[]

  // Settings & Configuration
  taxPercentage: number | null  // 10 (percent)
  enableStock: 'ENABLED' | 'DISABLED'
  useCategories: boolean
  useSubcategories: boolean
  useBrands: boolean
}

interface SocialMediaLink {
  name: string              // "Facebook", "Instagram", etc.
  imageUrl: string         // Icon/logo URL
  linkUrl: string          // Full URL to social profile
}

interface BusinessHour {
  day: string              // "Monday", "Tuesday", etc.
  openTime: string         // "08:00" (24-hour format)
  closeTime: string        // "22:00" (24-hour format)
  isClosed: boolean        // true if closed on this day
}
```

## Hook API Reference

### useBusinessSettingsCache()

```typescript
interface UseBusinessSettingsCacheOptions {
  businessId?: string
  onSettingsUpdate?: (settings: BusinessSettingsResponse) => void
  cacheDurationMs?: number // Default: 3600000 (1 hour)
}

const {
  settings,              // BusinessSettingsResponse | default
  isLoading,            // boolean
  error,                // string | null
} = useBusinessSettingsCache(options)
```

### Helper Functions

```typescript
// Get settings synchronously (for use outside React)
import { getBusinessSettingsSync } from '@/hooks/use-business-settings-cache'
const settings = getBusinessSettingsSync()

// Clear the cache
import { clearBusinessSettingsCache } from '@/hooks/use-business-settings-cache'
clearBusinessSettingsCache()
```

## Common Use Cases

### 1. Footer with Social Links

```typescript
export function Footer() {
  const { settings } = useBusinessSettingsCache()

  return (
    <footer style={{ backgroundColor: settings.primaryColor }}>
      <div className="footer-content">
        <div className="business-info">
          <h3>{settings.businessName}</h3>
          <img src={settings.logoBusinessUrl} alt="Logo" style={{ maxWidth: 100 }} />
        </div>

        <div className="contact-section">
          <h4>Contact Us</h4>
          <p>{settings.contactAddress}</p>
          <p>
            <a href={`tel:${settings.contactPhone}`}>
              {settings.contactPhone}
            </a>
          </p>
          <p>
            <a href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          </p>
        </div>

        <div className="social-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            {settings.socialMedia?.map((social) => (
              <a
                key={social.name}
                href={social.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
              >
                <img src={social.imageUrl} alt={social.name} width={32} />
              </a>
            ))}
          </div>
        </div>

        <div className="hours-section">
          <h4>Business Hours</h4>
          {settings.businessHours?.map((hour) => (
            <div key={hour.day} className="hour-row">
              <span className="day">{hour.day}</span>
              <span className="time">
                {hour.isClosed ? (
                  'Closed'
                ) : (
                  `${hour.openTime} - ${hour.closeTime}`
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
```

### 2. Header with Branding

```typescript
export function Header() {
  const { settings } = useBusinessSettingsCache()

  return (
    <header
      style={{
        backgroundColor: settings.primaryColor,
        color: 'white'
      }}
    >
      <div className="header-container">
        <div className="logo-section">
          <img
            src={settings.logoBusinessUrl}
            alt={settings.businessName}
            className="logo"
          />
          <h1>{settings.businessName}</h1>
        </div>
        <nav>{/* Navigation */}</nav>
      </div>
    </header>
  )
}
```

### 3. Contact Page

```typescript
export function ContactPage() {
  const { settings } = useBusinessSettingsCache()

  return (
    <div className="contact-page">
      <section className="info-section">
        <h2>Contact Information</h2>
        <div className="info-grid">
          <div>
            <h3>Address</h3>
            <p>{settings.contactAddress}</p>
          </div>
          <div>
            <h3>Phone</h3>
            <p>
              <a href={`tel:${settings.contactPhone}`}>
                {settings.contactPhone}
              </a>
            </p>
          </div>
          <div>
            <h3>Email</h3>
            <p>
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="hours-section">
        <h2>Business Hours</h2>
        <table>
          <tbody>
            {settings.businessHours?.map((hour) => (
              <tr key={hour.day}>
                <td className="day">{hour.day}</td>
                <td className="time">
                  {hour.isClosed ? (
                    <span className="closed">Closed</span>
                  ) : (
                    <span>{hour.openTime} - {hour.closeTime}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="social-section">
        <h2>Follow Us</h2>
        <div className="social-links">
          {settings.socialMedia?.map((social) => (
            <a
              key={social.name}
              href={social.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={social.imageUrl} alt={social.name} />
              <span>{social.name}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
```

### 4. With Fallback Defaults

```typescript
export function SafeBusinessDisplay() {
  const { settings } = useBusinessSettingsCache()

  // These will always have values (fallback to defaults if needed)
  const primaryColor = settings?.primaryColor || '#000000'
  const businessName = settings?.businessName || 'Our Business'
  const socialMedia = settings?.socialMedia || []
  const businessHours = settings?.businessHours || []

  return (
    <div style={{ color: primaryColor }}>
      <h1>{businessName}</h1>
      {socialMedia.length > 0 && (
        <div className="social">
          {socialMedia.map((s) => (
            <a key={s.name} href={s.linkUrl}>
              <img src={s.imageUrl} alt={s.name} />
            </a>
          ))}
        </div>
      )}
      {businessHours.length > 0 && (
        <div className="hours">
          {businessHours.map((h) => (
            <div key={h.day}>
              {h.day}: {h.isClosed ? 'Closed' : `${h.openTime}-${h.closeTime}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Testing the Cache

```typescript
// In your browser console:

// 1. Check cached data
localStorage.getItem('business_settings_cache')

// 2. Clear cache
localStorage.removeItem('business_settings_cache')

// 3. View cache info
const cache = JSON.parse(localStorage.getItem('business_settings_cache') || '{}')
console.log('Cached at:', new Date(cache.timestamp))
console.log('Hash:', cache.hash)
console.log('Data:', cache.data)
```

## Performance Tips

1. **Cache Duration**: Set longer durations (6-12 hours) for stable businesses
2. **Lazy Loading**: Load settings only when needed, not on every page
3. **Memoization**: Use React.memo for components that use settings heavily
4. **Batch Updates**: Wait for settings load before rendering dependent UI

## Troubleshooting

### Settings not showing?
- Check if businessId is passed to hook
- Check browser console for errors
- Clear cache and reload

### Cache not updating?
- Check if cache duration has passed
- Manually clear cache: `clearBusinessSettingsCache()`
- Check API endpoint is responding

### API calls too frequent?
- Increase cacheDurationMs
- Check if multiple instances of hook are running
- Use singleton pattern for settings store
