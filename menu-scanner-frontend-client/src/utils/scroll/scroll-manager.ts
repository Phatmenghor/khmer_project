/**
 * Scroll Position Manager
 * Manages scroll positions with cookie/localStorage support for persistence
 */

const SCROLL_STORAGE_KEY = "scroll_positions";
const SCROLL_COOKIE_EXPIRY = 7; // days

export interface ScrollPosition {
  path: string;
  position: number;
  timestamp: number;
}

export class ScrollManager {
  private static instance: ScrollManager;
  private positions: Map<string, ScrollPosition> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ScrollManager {
    if (!ScrollManager.instance) {
      ScrollManager.instance = new ScrollManager();
    }
    return ScrollManager.instance;
  }

  /**
   * Load scroll positions from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(SCROLL_STORAGE_KEY);
      if (stored) {
        const data: ScrollPosition[] = JSON.parse(stored);
        const now = Date.now();
        const maxAge = SCROLL_COOKIE_EXPIRY * 24 * 60 * 60 * 1000;

        // Filter out old positions (older than SCROLL_COOKIE_EXPIRY days)
        data
          .filter((item) => now - item.timestamp < maxAge)
          .forEach((item) => {
            this.positions.set(item.path, item);
          });
      }
    } catch (error) {
      console.error("Error loading scroll positions:", error);
    }
  }

  /**
   * Save scroll positions to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const data = Array.from(this.positions.values());
      localStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving scroll positions:", error);
    }
  }

  /**
   * Save scroll position for a path with debouncing
   */
  savePosition(path: string, position: number, debounceMs: number = 150): void {
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.positions.set(path, {
        path,
        position,
        timestamp: Date.now(),
      });
      this.saveToStorage();
      this.debounceTimers.delete(path);
    }, debounceMs);

    this.debounceTimers.set(path, timer);
  }

  /**
   * Get scroll position for a path
   */
  getPosition(path: string): number | null {
    const position = this.positions.get(path);
    if (!position) return null;

    // Check if position is still valid
    const now = Date.now();
    const maxAge = SCROLL_COOKIE_EXPIRY * 24 * 60 * 60 * 1000;

    if (now - position.timestamp > maxAge) {
      this.positions.delete(path);
      this.saveToStorage();
      return null;
    }

    return position.position;
  }

  /**
   * Clear scroll position for a path
   */
  clearPosition(path: string): void {
    this.positions.delete(path);
    this.saveToStorage();
  }

  /**
   * Clear all scroll positions
   */
  clearAllPositions(): void {
    this.positions.clear();
    this.saveToStorage();
  }

  /**
   * Get all stored positions
   */
  getAllPositions(): ScrollPosition[] {
    return Array.from(this.positions.values());
  }

  /**
   * Cleanup old positions (older than expiry days)
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = SCROLL_COOKIE_EXPIRY * 24 * 60 * 60 * 1000;

    let changed = false;
    this.positions.forEach((position, path) => {
      if (now - position.timestamp > maxAge) {
        this.positions.delete(path);
        changed = true;
      }
    });

    if (changed) {
      this.saveToStorage();
    }
  }
}

// Export singleton instance
export const scrollManager = ScrollManager.getInstance();
