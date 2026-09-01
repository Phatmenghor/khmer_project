/**
 * Extract the subdomain from the current hostname.
 *
 * Local dev:  mega-store.lvh.me:3000  → "mega-store"
 * Production: mega-store.emenu-cambodia.com → "mega-store"
 * No subdomain / localhost / IP → null
 */
export function getSubdomain(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "emenu-cambodia.com";

  // Strip port if present (hostname doesn't include port, but guard anyway)
  const host = hostname.split(":")[0];

  if (!host.endsWith(`.${baseDomain}`) && host !== baseDomain) {
    return null;
  }

  const subdomain = host.slice(0, host.length - baseDomain.length - 1);
  return subdomain.length > 0 ? subdomain : null;
}
