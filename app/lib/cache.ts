interface CacheItem<T> {
  value: T;
  timestamp: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    return item.value;
  }

  set<T>(key: string, value: T, expirationMs: number): void {
    // Clear any existing timeout
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key)!);
    }

    // Set the value in cache
    this.cache.set(key, { value, timestamp: Date.now() });

    // Set up expiration
    const timeout = setTimeout(() => {
      console.log(`Cache expired for key: ${key}`);
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, expirationMs);

    this.timeouts.set(key, timeout);
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key)!);
        this.timeouts.delete(key);
      }
    } else {
      this.cache.clear();
      for (const timeout of this.timeouts.values()) {
        clearTimeout(timeout);
      }
      this.timeouts.clear();
    }
  }
}

// Create a singleton instance
export const cache = new SimpleCache();
