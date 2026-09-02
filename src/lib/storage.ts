import type { GlobeComment } from './types';

const CACHE_KEY = 'cached_globe_pins';

export function loadCachedPins(): GlobeComment[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GlobeComment[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveCachedPins(pins: GlobeComment[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(pins));
  } catch {
    // storage full or unavailable — non-fatal
  }
}
