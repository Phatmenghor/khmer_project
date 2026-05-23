const CACHE_KEY = "home_page_snapshot";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface HomeSnapshot {
  banners: unknown[];
  categories: unknown[];
  promotionProducts: unknown[];
  featuredProducts: unknown[];
  brands: unknown[];
  featuredPagination: {
    currentPage: number;
    hasMore: boolean;
    totalPages: number;
  };
  timestamp: number;
}

export function saveHomeSnapshot(data: Omit<HomeSnapshot, "timestamp">): void {
  try {
    const snapshot: HomeSnapshot = { ...data, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {}
}

export function loadHomeSnapshot(): HomeSnapshot | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const snapshot: HomeSnapshot = JSON.parse(raw);
    if (Date.now() - snapshot.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}
