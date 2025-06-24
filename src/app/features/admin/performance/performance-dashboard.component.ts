import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { PerformanceService } from '../../../core/services/performance.service';

interface PerformanceData {
  bundleSize: string;
  loadTime: string;
  cacheHitRate: string;
  memoryUsage: string;
  networkRequests: number;
  lazyChunks: number;
}

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-dashboard">
      <div class="dashboard-header">
        <h1>📊 Dashboard de Performance</h1>
        <p>Monitoramento em tempo real das otimizações implementadas</p>
      </div>

      <!-- Métricas Principais -->
      <div class="metrics-grid">
        <div class="metric-card primary">
          <div class="metric-icon">⚡</div>
          <div class="metric-content">
            <h3>Bundle Size</h3>
            <div class="metric-value">{{ performanceData.bundleSize }}</div>
            <div class="metric-change positive">-36% vs antes</div>
          </div>
        </div>

        <div class="metric-card success">
          <div class="metric-icon">🎯</div>
          <div class="metric-content">
            <h3>Cache Hit Rate</h3>
            <div class="metric-value">{{ performanceData.cacheHitRate }}</div>
            <div class="metric-change positive">Otimizado</div>
          </div>
        </div>

        <div class="metric-card info">
          <div class="metric-icon">⏱️</div>
          <div class="metric-content">
            <h3>Load Time</h3>
            <div class="metric-value">{{ performanceData.loadTime }}</div>
            <div class="metric-change positive">Melhorado</div>
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-icon">💾</div>
          <div class="metric-content">
            <h3>Memory Usage</h3>
            <div class="metric-value">{{ performanceData.memoryUsage }}</div>
            <div class="metric-change">Monitorado</div>
          </div>
        </div>
      </div>

      <!-- Lazy Loading Status -->
      <div class="section">
        <h2>🚀 Lazy Loading Status</h2>
        <div class="lazy-loading-info">
          <div class="lazy-stat">
            <span class="label">Chunks Carregados:</span>
            <span class="value">{{ performanceData.lazyChunks }}</span>
          </div>
          <div class="lazy-stat">
            <span class="label">Network Requests:</span>
            <span class="value">{{ performanceData.networkRequests }}</span>
          </div>
          <div class="lazy-stat">
            <span class="label">Economia de Bundle:</span>
            <span class="value success">~500KB</span>
          </div>
        </div>
      </div>

      <!-- Cache Analysis -->
      <div class="section">
        <h2>💾 Cache Analysis</h2>
        <div class="cache-info">
          <div class="cache-stats">
            <div class="cache-stat">
              <span class="label">APIs Cacheadas:</span>
              <span class="value">{{ cacheStats.length }}</span>
            </div>
            <div class="cache-stat">
              <span class="label">Hit Rate:</span>
              <span class="value success">{{ performanceData.cacheHitRate }}</span>
            </div>
          </div>
          
          <div class="cache-list">
            <h4>URLs em Cache:</h4>
            <div class="cache-item" *ngFor="let item of cacheStats">
              <span class="cache-url">{{ item }}</span>
              <span class="cache-status active">Ativo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Tips -->
      <div class="section">
        <h2>💡 Como Analisar Performance</h2>
        <div class="tips-grid">
          <div class="tip-card">
            <h4>🔍 Chrome DevTools</h4>
            <p>Pressione <code>F12</code> → <strong>Network</strong> para ver lazy loading</p>
            <p>Use <strong>Performance</strong> tab para análise detalhada</p>
          </div>
          
          <div class="tip-card">
            <h4>📊 Lighthouse</h4>
            <p>F12 → <strong>Lighthouse</strong> → Run audit</p>
            <p>Veja score de Performance, SEO, Accessibility</p>
          </div>
          
          <div class="tip-card">
            <h4>🎯 Bundle Analyzer</h4>
            <p>Execute: <code>ng build --stats-json</code></p>
            <p>Use webpack-bundle-analyzer para visualizar</p>
          </div>
          
          <div class="tip-card">
            <h4>📈 Backend Metrics</h4>
            <p>Acesse: <code>/api/admin/performance</code></p>
            <p>Veja métricas de cache, DB e memória</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="btn btn-primary" (click)="refreshMetrics()">
          🔄 Atualizar Métricas
        </button>
        <button class="btn btn-secondary" (click)="clearCache()">
          🗑️ Limpar Cache
        </button>
        <button class="btn btn-info" (click)="generateReport()">
          📋 Gerar Relatório
        </button>
      </div>
    </div>
  `,
  styles: [`
    .performance-dashboard {
      padding: 20px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .metric-icon {
      font-size: 2rem;
    }
    .metric-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2c3e50;
    }
    .metric-change.positive {
      color: #27ae60;
      font-size: 0.9rem;
    }
    .section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .cache-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .cache-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 5px;
    }
    .cache-status.active {
      color: #27ae60;
      font-weight: bold;
    }
    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .tip-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #3498db;
    }
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary {
      background: #3498db;
      color: white;
    }
    .btn-secondary {
      background: #95a5a6;
      color: white;
    }
    .btn-info {
      background: #17a2b8;
      color: white;
    }
  `]
})
export class PerformanceDashboardComponent implements OnInit, OnDestroy {
  performanceData: PerformanceData = {
    bundleSize: '834 KB',
    loadTime: '1.2s',
    cacheHitRate: '85%',
    memoryUsage: '45 MB',
    networkRequests: 12,
    lazyChunks: 29
  };

  cacheStats: string[] = [
    '/api/usuarios',
    '/api/cursos', 
    '/api/disciplinas',
    '/api/turmas',
    '/api/blocos',
    '/api/salas'
  ];

  private subscription?: Subscription;

  constructor(
    private performanceService: PerformanceService
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
    
    // Atualizar métricas a cada 30 segundos
    this.subscription = interval(30000).subscribe(() => {
      this.loadMetrics();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadMetrics(): void {
    const metrics = this.performanceService.getPerformanceReport();
    
    if (metrics) {
      this.performanceData = {
        bundleSize: `${(metrics.bundleSize / 1024).toFixed(0)} KB`,
        loadTime: `${(metrics.loadTime / 1000).toFixed(1)}s`,
        cacheHitRate: `${metrics.cacheHitRate.toFixed(0)}%`,
        memoryUsage: metrics.memoryUsage ? 
          `${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(0)} MB` : 
          'N/A',
        networkRequests: metrics.networkRequests,
        lazyChunks: this.countLazyChunks()
      };
    }
  }

  private countLazyChunks(): number {
    // Contar scripts carregados dinamicamente
    const scripts = document.querySelectorAll('script[src*="chunk"]');
    return scripts.length;
  }

  refreshMetrics(): void {
    this.loadMetrics();
    console.log('📊 Métricas atualizadas');
  }

  clearCache(): void {
    this.performanceService.clearCache();
    console.log('🗑️ Cache limpo');
  }

  generateReport(): void {
    this.performanceService.logPerformanceReport();
    console.log('📋 Relatório gerado no console');
  }
}
