


const SCROLL_STORAGE_KEY = "scroll_positions";
const SCROLL_COOKIE_EXPIRY = 7;

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


  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(SCROLL_STORAGE_KEY);
      if (stored) {
        const data: ScrollPosition[] = JSON.parse(stored);
        const now = Date.now();
        const maxAge = SCROLL_COOKIE_EXPIRY * 24 * 60 * 60 * 1000;


        data
          .filter((item) => now - item.timestamp < maxAge)
          .forEach((item) => {
            this.positions.set(item.path, item);
          });
      }
    } catch (error) {
    }
  }


  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const data = Array.from(this.positions.values());
      localStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
    }
  }


  savePosition(path: string, position: number, debounceMs: number = 150): void {

    const existingTimer = this.debounceTimers.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }


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


  getPosition(path: string): number | null {
    const position = this.positions.get(path);
    if (!position) return null;


    const now = Date.now();
    const maxAge = SCROLL_COOKIE_EXPIRY * 24 * 60 * 60 * 1000;

    if (now - position.timestamp > maxAge) {
      this.positions.delete(path);
      this.saveToStorage();
      return null;
    }

    return position.position;
  }


  clearPosition(path: string): void {
    this.positions.delete(path);
    this.saveToStorage();
  }


  clearAllPositions(): void {
    this.positions.clear();
    this.saveToStorage();
  }


  getAllPositions(): ScrollPosition[] {
    return Array.from(this.positions.values());
  }


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


export const scrollManager = ScrollManager.getInstance();
