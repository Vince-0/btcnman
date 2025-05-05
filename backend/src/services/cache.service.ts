/**
 * Cache service for Bitcoin RPC data
 * Provides a centralized caching mechanism for all RPC data
 */

// Cache structure for different types of data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheStore {
  nodeInfo: CacheEntry<any> | null;
  peers: CacheEntry<any> | null;
  bannedPeers: CacheEntry<any> | null;
  blockchainInfo: CacheEntry<any> | null;
  networkInfo: CacheEntry<any> | null;
  mempoolInfo: CacheEntry<any> | null;
  walletInfo: CacheEntry<any> | null;
  // Add more cache entries as needed
  [key: string]: CacheEntry<any> | null;
}

// Default cache expiration time (5 minutes)
const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

// Initialize the cache store
const cacheStore: CacheStore = {
  nodeInfo: null,
  peers: null,
  bannedPeers: null,
  blockchainInfo: null,
  networkInfo: null,
  mempoolInfo: null,
  walletInfo: null,
};

/**
 * Check if a cache entry is valid (not expired)
 * @param timestamp The timestamp of the cache entry
 * @param expiration The expiration time in milliseconds (default: 5 minutes)
 * @returns True if the cache is valid, false otherwise
 */
export function isCacheValid(timestamp: number, expiration: number = DEFAULT_CACHE_EXPIRATION): boolean {
  if (!timestamp) return false;
  return Date.now() - timestamp < expiration;
}

/**
 * Get data from cache
 * @param key The cache key
 * @param useCache Whether to use the cache (default: true)
 * @returns The cached data or null if not found or expired
 */
export function getFromCache<T>(key: string, useCache: boolean = true): T | null {
  if (!useCache || !cacheStore[key] || !isCacheValid(cacheStore[key]!.timestamp)) {
    return null;
  }

  return cacheStore[key]!.data as T;
}

/**
 * Save data to cache
 * @param key The cache key
 * @param data The data to cache
 */
export function saveToCache<T>(key: string, data: T): void {
  cacheStore[key] = {
    data,
    timestamp: Date.now()
  };
}

/**
 * Get the timestamp of a cache entry
 * @param key The cache key
 * @returns The timestamp or 0 if not found
 */
export function getCacheTimestamp(key: string): number {
  return cacheStore[key]?.timestamp || 0;
}

/**
 * Clear all cache or a specific cache entry
 * @param key Optional cache key to clear
 * @returns Object with success message
 */
export function clearCache(key?: string): { message: string } {
  if (key) {
    if (cacheStore[key]) {
      cacheStore[key] = null;
      return { message: `Cache for ${key} cleared` };
    }
    return { message: `Cache key ${key} not found` };
  }

  // Clear all cache
  Object.keys(cacheStore).forEach(k => {
    cacheStore[k] = null;
  });

  return { message: 'All cache cleared' };
}
