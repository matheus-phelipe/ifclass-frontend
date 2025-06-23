import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-stats mb-4">
      <div class="row g-3">
        <div class="col-6 col-md-3" *ngFor="let stat of stats">
          <div class="stat-card" [class]="'stat-card-' + stat.color">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i [class]="'bi ' + stat.icon"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-subtitle" *ngIf="stat.subtitle">{{ stat.subtitle }}</div>
                <div class="stat-trend" *ngIf="stat.trend" [class.positive]="stat.trend.isPositive" [class.negative]="!stat.trend.isPositive">
                  <i [class]="stat.trend.isPositive ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                  {{ stat.trend.value }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-stats {
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border-left: 4px solid;
      height: 100%;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .stat-card-primary { border-left-color: #0d6efd; }
    .stat-card-success { border-left-color: #198754; }
    .stat-card-warning { border-left-color: #ffc107; }
    .stat-card-info { border-left-color: #0dcaf0; }
    .stat-card-danger { border-left-color: #dc3545; }

    .stat-card-body {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-card-primary .stat-icon { background: #0d6efd; }
    .stat-card-success .stat-icon { background: #198754; }
    .stat-card-warning .stat-icon { background: #ffc107; }
    .stat-card-info .stat-icon { background: #0dcaf0; }
    .stat-card-danger .stat-icon { background: #dc3545; }

    .stat-content {
      flex: 1;
      min-width: 0;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #333;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }

    .stat-subtitle {
      font-size: 0.75rem;
      color: #999;
      margin-bottom: 0.5rem;
    }

    .stat-trend {
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .stat-trend.positive {
      color: #198754;
    }

    .stat-trend.negative {
      color: #dc3545;
    }

    @media (max-width: 768px) {
      .stat-card-body {
        padding: 1rem;
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
      }

      .stat-value {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardStatsComponent {
  @Input() stats: StatCard[] = [];
}
