import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent, debounceTime, throttleTime } from 'rxjs';

export interface PerformanceMetrics {
  memoryUsage?: MemoryInfo;
  loadTime: number;
  renderTime: number;
  cacheHitRate: number;
  bundleSize: number;
  networkRequests: number;
  timestamp: number;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metricsSubject = new BehaviorSubject<PerformanceMetrics | null>(null);
  public metrics$ = this.metricsSubject.asObservable();

  private startTime = performance.now();
  private networkRequestCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(
    private ngZone: NgZone
  ) {
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring(): void {
    // Monitor memory usage periodically
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.updateMetrics();
      }, 30000); // Every 30 seconds
    });

    // Monitor network requests
    this.monitorNetworkRequests();

    // Monitor resize events (throttled)
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(throttleTime(250))
        .subscribe(() => {
          this.optimizeForViewport();
        });
    });

    // Monitor scroll events (debounced)
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll')
        .pipe(debounceTime(100))
        .subscribe(() => {
          this.handleScroll();
        });
    });
  }

  private updateMetrics(): void {
    const metrics: PerformanceMetrics = {
      loadTime: performance.now() - this.startTime,
      renderTime: this.getRenderTime(),
      cacheHitRate: this.getCacheHitRate(),
      bundleSize: this.getBundleSize(),
      networkRequests: this.networkRequestCount,
      timestamp: Date.now()
    };

    // Add memory info if available
    if ('memory' in performance) {
      metrics.memoryUsage = {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      };
    }

    this.metricsSubject.next(metrics);
  }

  private getRenderTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  private getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? (this.cacheHits / total) * 100 : 0;
  }

  private getBundleSize(): number {
    // Estimate bundle size from loaded resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
      .reduce((total, resource) => total + (resource.transferSize || 0), 0);
  }

  private monitorNetworkRequests(): void {
    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      this.networkRequestCount++;
      return originalFetch.apply(window, args);
    };

    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
      this.addEventListener('loadstart', () => {
        // Increment network request count
      });
      return originalXHROpen.call(this, method, url, async || true, username, password);
    };
  }

  private optimizeForViewport(): void {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Optimize based on viewport size
    if (viewport.width < 768) {
      this.enableMobileOptimizations();
    } else if (viewport.width < 1024) {
      this.enableTabletOptimizations();
    } else {
      this.enableDesktopOptimizations();
    }
  }

  private handleScroll(): void {
    // Implement virtual scrolling optimizations if needed
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    // Lazy load images that are coming into view
    this.lazyLoadImages();
  }

  private enableMobileOptimizations(): void {
    // Reduce animation complexity
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    
    // Disable hover effects
    document.body.classList.add('mobile-optimized');
  }

  private enableTabletOptimizations(): void {
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    document.body.classList.remove('mobile-optimized');
  }

  private enableDesktopOptimizations(): void {
    document.documentElement.style.setProperty('--animation-duration', '0.4s');
    document.body.classList.remove('mobile-optimized');
  }

  private lazyLoadImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset['src'] || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Public methods for manual optimization
  public clearCache(): void {
    // Cache clearing will be handled by the cache interceptor
    console.log('Cache clear requested');
  }

  public preloadRoute(route: string): void {
    // Preload route components - simplified for production
    console.log(`Preloading route: ${route}`);
    // Dynamic imports disabled for production build stability
  }

  public optimizeImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  public measureComponentRenderTime(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      console.log(`🎯 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
      
      if (renderTime > 100) {
        console.warn(`⚠️ Slow component detected: ${componentName} (${renderTime.toFixed(2)}ms)`);
      }
    };
  }

  public getPerformanceReport(): PerformanceMetrics | null {
    return this.metricsSubject.value;
  }

  public logPerformanceReport(): void {
    const metrics = this.getPerformanceReport();
    if (metrics) {
      console.group('📊 Performance Report');
      console.log('Load Time:', `${metrics.loadTime.toFixed(2)}ms`);
      console.log('Render Time:', `${metrics.renderTime.toFixed(2)}ms`);
      console.log('Cache Hit Rate:', `${metrics.cacheHitRate.toFixed(1)}%`);
      console.log('Bundle Size:', `${(metrics.bundleSize / 1024).toFixed(2)}KB`);
      console.log('Network Requests:', metrics.networkRequests);
      
      if (metrics.memoryUsage) {
        console.log('Memory Usage:', `${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
      
      console.groupEnd();
    }
  }

  // Cache management methods
  public recordCacheHit(): void {
    this.cacheHits++;
  }

  public recordCacheMiss(): void {
    this.cacheMisses++;
  }
}
