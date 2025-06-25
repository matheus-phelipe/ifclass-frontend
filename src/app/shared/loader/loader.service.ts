import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoaderType } from './loader.component';

export interface LoaderConfig {
  type?: LoaderType;
  text?: string;
  transparent?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<LoaderConfig>({});

  loading$ = this.loadingSubject.asObservable();
  config$ = this.configSubject.asObservable();

  private requests = 0;
  private namedLoaders = new Map<string, BehaviorSubject<boolean>>();

  // Global loader methods
  show(config?: LoaderConfig) {
    this.requests++;
    if (config) {
      this.configSubject.next(config);
    }
    this.loadingSubject.next(true);
  }

  hide() {
    this.requests = Math.max(0, this.requests - 1);
    if (this.requests === 0) {
      this.loadingSubject.next(false);
    }
  }

  reset() {
    this.requests = 0;
    this.loadingSubject.next(false);
  }

  // Named loader methods for specific components
  showNamed(name: string, config?: LoaderConfig): void {
    if (!this.namedLoaders.has(name)) {
      this.namedLoaders.set(name, new BehaviorSubject<boolean>(false));
    }
    this.namedLoaders.get(name)!.next(true);
  }

  hideNamed(name: string): void {
    if (this.namedLoaders.has(name)) {
      this.namedLoaders.get(name)!.next(false);
    }
  }

  getNamedLoader(name: string): Observable<boolean> {
    if (!this.namedLoaders.has(name)) {
      this.namedLoaders.set(name, new BehaviorSubject<boolean>(false));
    }
    return this.namedLoaders.get(name)!.asObservable();
  }

  // Convenience methods
  showSpinner(text?: string) {
    this.show({ type: 'spinner', text });
  }

  showDots(text?: string) {
    this.show({ type: 'dots', text });
  }

  showPulse(text?: string) {
    this.show({ type: 'pulse', text });
  }

  // Async operation wrapper
  async withLoader<T>(
    operation: () => Promise<T>,
    config?: LoaderConfig
  ): Promise<T> {
    this.show(config);
    try {
      return await operation();
    } finally {
      this.hide();
    }
  }

  // Named async operation wrapper
  async withNamedLoader<T>(
    name: string,
    operation: () => Promise<T>,
    config?: LoaderConfig
  ): Promise<T> {
    this.showNamed(name, config);
    try {
      return await operation();
    } finally {
      this.hideNamed(name);
    }
  }
}