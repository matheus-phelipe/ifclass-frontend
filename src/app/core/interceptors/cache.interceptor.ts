import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class HttpCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  // URLs que devem ser cacheadas
  private readonly CACHEABLE_URLS = [
    '/api/usuarios',
    '/api/cursos',
    '/api/disciplinas',
    '/api/turmas',
    '/api/blocos',
    '/api/salas',
    '/api/coordenacao/estatisticas',
    '/api/admin/dashboard'
  ];

  // URLs que devem ter cache mais longo
  private readonly LONG_CACHE_URLS = [
    '/api/blocos',
    '/api/salas'
  ];

  shouldCache(url: string, method: string): boolean {
    return method === 'GET' && 
           this.CACHEABLE_URLS.some(cacheableUrl => url.includes(cacheableUrl));
  }

  getTTL(url: string): number {
    if (this.LONG_CACHE_URLS.some(longCacheUrl => url.includes(longCacheUrl))) {
      return 15 * 60 * 1000; // 15 minutes for static data
    }
    return this.DEFAULT_TTL;
  }

  get(key: string): HttpResponse<any> | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  set(key: string, response: HttpResponse<any>, ttl?: number): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry = {
      response: response.clone(),
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    };

    this.cache.set(key, entry);
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Remove entries that match the pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Invalidate cache for specific entities
  invalidateUsers(): void {
    this.invalidate('/api/usuarios');
  }

  invalidateCourses(): void {
    this.invalidate('/api/cursos');
  }

  invalidateDisciplines(): void {
    this.invalidate('/api/disciplinas');
  }

  invalidateClasses(): void {
    this.invalidate('/api/turmas');
  }

  invalidateRooms(): void {
    this.invalidate('/api/blocos');
    this.invalidate('/api/salas');
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
const cacheService = new HttpCacheService();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    // For non-GET requests, invalidate related cache
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      invalidateCacheForUrl(req.url);
    }
    return next(req);
  }

  // Check if this URL should be cached
  if (!cacheService.shouldCache(req.url, req.method)) {
    return next(req);
  }

  // Create cache key
  const cacheKey = createCacheKey(req);

  // Try to get from cache
  const cachedResponse = cacheService.get(cacheKey);
  if (cachedResponse) {
    return of(cachedResponse);
  }

  // Not in cache, make the request
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200) {
        const ttl = cacheService.getTTL(req.url);
        cacheService.set(cacheKey, event, ttl);
      }
    })
  );
};

function createCacheKey(req: any): string {
  // Include URL and relevant headers in cache key
  let key = `${req.method}:${req.url}`;
  
  // Include query parameters
  if (req.params && req.params.keys().length > 0) {
    const params = req.params.toString();
    key += `?${params}`;
  }

  return key;
}

function invalidateCacheForUrl(url: string): void {
  // Map URLs to cache invalidation patterns
  if (url.includes('/api/usuarios')) {
    cacheService.invalidateUsers();
  } else if (url.includes('/api/cursos')) {
    cacheService.invalidateCourses();
  } else if (url.includes('/api/disciplinas')) {
    cacheService.invalidateDisciplines();
  } else if (url.includes('/api/turmas')) {
    cacheService.invalidateClasses();
  } else if (url.includes('/api/blocos') || url.includes('/api/salas')) {
    cacheService.invalidateRooms();
  }
}

// Export cache service for manual cache management
export { cacheService as HttpCacheService };
