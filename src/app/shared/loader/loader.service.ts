import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  private requests = 0;

  show() {
    this.requests++;
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
} 