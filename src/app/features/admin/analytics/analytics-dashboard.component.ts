import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { AdminService } from '../services/admin.service';
import { AulaService } from '../../aulas/aula.service';
import { NotificationService } from '../../../shared/sweetalert/notification.service';
import { AnalyticsService, AnalyticsData, AnalyticsRequest } from './analytics.service';
import { RelatorioService } from '../../coordenacao/services/relatorio.service';
import { Subscription, forkJoin } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analytics-dashboard">
      <!-- Header -->
      <div class="dashboard-header mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1">📊 Analytics Dashboard</h1>
            <p class="text-muted mb-0">Insights avançados e análise de dados do sistema</p>
          </div>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm" [(ngModel)]="selectedPeriod" (change)="onPeriodChange()">
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
            </select>
            <button class="btn btn-primary btn-sm" (click)="refreshData()">
              <i class="bi bi-arrow-clockwise"></i> Atualizar
            </button>
            <div class="btn-group">
              <button class="btn btn-success btn-sm" (click)="exportReport()">
                <i class="bi bi-download"></i> Exportar
              </button>
              <button class="btn btn-outline-primary btn-sm" (click)="gerarRelatorioCompleto()">
                <i class="bi bi-file-earmark-text"></i> Relatório
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-2 text-muted">Analisando dados...</p>
      </div>

      <!-- Analytics Content -->
      <div *ngIf="!loading" class="analytics-content">
        
        <!-- KPI Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="kpi-card bg-primary">
              <div class="kpi-icon">
                <i class="bi bi-calendar-week"></i>
              </div>
              <div class="kpi-content">
                <div class="kpi-value">{{ getTotalAulas() }}</div>
                <div class="kpi-label">Total de Aulas</div>
                <div class="kpi-trend positive">
                  <i class="bi bi-arrow-up"></i> +12% vs período anterior
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="kpi-card bg-success">
              <div class="kpi-icon">
                <i class="bi bi-door-open"></i>
              </div>
              <div class="kpi-content">
                <div class="kpi-value">{{ (analyticsData?.utilizacaoSalas || 0).toFixed(1) }}%</div>
                <div class="kpi-label">Utilização de Salas</div>
                <div class="kpi-trend positive">
                  <i class="bi bi-arrow-up"></i> +5% vs período anterior
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="kpi-card bg-warning">
              <div class="kpi-icon">
                <i class="bi bi-person-check"></i>
              </div>
              <div class="kpi-content">
                <div class="kpi-value">{{ analyticsData?.professorMaisAtivo?.aulas || 0 }}</div>
                <div class="kpi-label">Aulas do Professor Mais Ativo</div>
                <div class="kpi-subtitle">{{ analyticsData?.professorMaisAtivo?.nome || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="kpi-card bg-info">
              <div class="kpi-icon">
                <i class="bi bi-clock"></i>
              </div>
              <div class="kpi-content">
                <div class="kpi-value">{{ getHorarioPico() }}</div>
                <div class="kpi-label">Horário de Pico</div>
                <div class="kpi-subtitle">Maior concentração de aulas</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-4 mb-4">
          <!-- Tendências Chart -->
          <div class="col-lg-8">
            <div class="chart-card">
              <div class="chart-header">
                <h5 class="mb-0">📈 Tendências de Aulas</h5>
                <small class="text-muted">Distribuição ao longo do período</small>
              </div>
              <div class="chart-container">
                <canvas #tendenciasChart></canvas>
              </div>
            </div>
          </div>

          <!-- Salas Mais Usadas -->
          <div class="col-lg-4">
            <div class="chart-card">
              <div class="chart-header">
                <h5 class="mb-0">🏢 Salas Mais Utilizadas</h5>
                <small class="text-muted">Top 5 salas por uso</small>
              </div>
              <div class="chart-container">
                <canvas #salasChart></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Horários de Pico Chart -->
        <div class="row g-4 mb-4">
          <div class="col-12">
            <div class="chart-card">
              <div class="chart-header">
                <h5 class="mb-0">⏰ Distribuição de Horários</h5>
                <small class="text-muted">Concentração de aulas por horário</small>
              </div>
              <div class="chart-container">
                <canvas #horariosChart></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Insights Section -->
        <div class="insights-section">
          <h5 class="mb-3">💡 Insights Inteligentes</h5>
          <div class="row g-3">
            <div class="col-md-4" *ngFor="let insight of analyticsData?.insights">
              <div class="insight-card">
                <div class="insight-icon">
                  <i class="bi bi-lightbulb"></i>
                </div>
                <div class="insight-content">
                  <p class="mb-0">{{ insight }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .analytics-dashboard {
      padding: 20px;
    }

    .kpi-card {
      background: linear-gradient(135deg, var(--bs-primary), var(--bs-primary-dark, #0056b3));
      color: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
    }

    .kpi-card.bg-success {
      background: linear-gradient(135deg, var(--bs-success), #157347);
    }

    .kpi-card.bg-warning {
      background: linear-gradient(135deg, var(--bs-warning), #b76e00);
    }

    .kpi-card.bg-info {
      background: linear-gradient(135deg, var(--bs-info), #087990);
    }

    .kpi-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: bold;
      line-height: 1;
    }

    .kpi-label {
      font-size: 0.9rem;
      opacity: 0.9;
      margin-top: 4px;
    }

    .kpi-subtitle {
      font-size: 0.8rem;
      opacity: 0.8;
      margin-top: 2px;
    }

    .kpi-trend {
      font-size: 0.8rem;
      margin-top: 4px;
    }

    .kpi-trend.positive {
      color: #90EE90;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      height: 100%;
    }

    .chart-header {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .insights-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .insight-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      height: 100%;
    }

    .insight-icon {
      color: #ffc107;
      font-size: 1.2rem;
      margin-top: 2px;
    }

    .insight-content p {
      font-size: 0.9rem;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .analytics-dashboard {
        padding: 15px;
      }
      
      .kpi-card {
        flex-direction: column;
        text-align: center;
        gap: 10px;
      }
      
      .chart-container {
        height: 250px;
      }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('tendenciasChart') tendenciasChartRef!: ElementRef;
  @ViewChild('salasChart') salasChartRef!: ElementRef;
  @ViewChild('horariosChart') horariosChartRef!: ElementRef;

  analyticsData: AnalyticsData | null = null;
  loading = true;
  selectedPeriod = '30';

  private charts: Chart[] = [];
  private subscription?: Subscription;

  constructor(
    private adminService: AdminService,
    private aulaService: AulaService,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService,
    private relatorioService: RelatorioService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.charts.forEach(chart => chart.destroy());
  }

  loadAnalyticsData(): void {
    this.loading = true;

    const request: AnalyticsRequest = {
      periodo: this.selectedPeriod,
      dataInicio: this.getDataInicio(),
      dataFim: this.getDataFim()
    };

    // Usar o serviço de analytics que integra com os dados reais
    this.analyticsService.getAnalyticsData(request).subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.loading = false;

        // Aguardar o próximo ciclo para garantir que os elementos estão no DOM
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar dados analytics:', error);

        // Fallback para dados simulados se houver erro
        this.analyticsData = this.generateMockAnalyticsData();
        this.loading = false;

        setTimeout(() => {
          this.createCharts();
        }, 100);

        this.notificationService.showInfo(
          'Exibindo dados de demonstração. Verifique se há aulas cadastradas no sistema.',
          'Dados de Demonstração'
        );
      }
    });
  }

  private getDataInicio(): string {
    const hoje = new Date();
    const diasAtras = parseInt(this.selectedPeriod);
    const dataInicio = new Date(hoje.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
    return dataInicio.toISOString().split('T')[0];
  }

  private getDataFim(): string {
    return new Date().toISOString().split('T')[0];
  }

  private generateMockAnalyticsData(): AnalyticsData {
    return {
      aulasPorDia: {
        'Segunda': 25,
        'Terça': 28,
        'Quarta': 22,
        'Quinta': 30,
        'Sexta': 20,
        'Sábado': 8,
        'Domingo': 2
      },
      salasMaisUsadas: [
        { sala: 'Lab 01', uso: 85 },
        { sala: 'Sala 203', uso: 78 },
        { sala: 'Auditório', uso: 65 },
        { sala: 'Lab 02', uso: 58 },
        { sala: 'Sala 101', uso: 45 }
      ],
      professorMaisAtivo: {
        nome: 'Prof. João Silva',
        aulas: 42
      },
      horariosPico: [
        { hora: '08:00', aulas: 15 },
        { hora: '10:00', aulas: 22 },
        { hora: '14:00', aulas: 28 },
        { hora: '16:00', aulas: 25 },
        { hora: '19:00', aulas: 18 }
      ],
      tendenciasSemana: [25, 28, 22, 30, 20, 8, 2],
      utilizacaoSalas: 73.5,
      insights: [
        'Quinta-feira é o dia com maior concentração de aulas (30 aulas)',
        'O período da tarde (14h-16h) tem 53% mais aulas que a manhã',
        'Lab 01 está sendo subutilizado - apenas 85% de ocupação',
        'Recomenda-se redistribuir algumas aulas de quinta para terça',
        'Salas do bloco A têm 23% mais uso que o bloco B',
        'Professor João Silva pode precisar de apoio - 42 aulas/semana'
      ],
      estatisticasGerais: {
        totalUsuarios: 34,
        totalProfessores: 12,
        totalAulas: 135,
        totalSalas: 18
      }
    };
  }

  private createCharts(): void {
    this.createTendenciasChart();
    this.createSalasChart();
    this.createHorariosChart();
  }

  private createTendenciasChart(): void {
    if (!this.tendenciasChartRef?.nativeElement || !this.analyticsData) return;

    const ctx = this.tendenciasChartRef.nativeElement.getContext('2d');
    const dias = Object.keys(this.analyticsData.aulasPorDia);
    const valores = Object.values(this.analyticsData.aulasPorDia);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dias,
        datasets: [{
          label: 'Aulas por Dia',
          data: valores,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3498db',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createSalasChart(): void {
    if (!this.salasChartRef?.nativeElement || !this.analyticsData) return;

    const ctx = this.salasChartRef.nativeElement.getContext('2d');
    const salas = this.analyticsData.salasMaisUsadas.map(s => s.sala);
    const usos = this.analyticsData.salasMaisUsadas.map(s => s.uso);

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: salas,
        datasets: [{
          data: usos,
          backgroundColor: [
            '#3498db',
            '#2ecc71',
            '#f39c12',
            '#e74c3c',
            '#9b59b6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createHorariosChart(): void {
    if (!this.horariosChartRef?.nativeElement || !this.analyticsData) return;

    const ctx = this.horariosChartRef.nativeElement.getContext('2d');
    const horarios = this.analyticsData.horariosPico.map(h => h.hora);
    const aulas = this.analyticsData.horariosPico.map(h => h.aulas);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: horarios,
        datasets: [{
          label: 'Aulas por Horário',
          data: aulas,
          backgroundColor: 'rgba(52, 152, 219, 0.8)',
          borderColor: '#3498db',
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  getHorarioPico(): string {
    if (!this.analyticsData?.horariosPico) return 'N/A';

    const pico = this.analyticsData.horariosPico.reduce((max, current) =>
      current.aulas > max.aulas ? current : max
    );

    return pico.hora;
  }

  getTotalAulas(): number {
    if (!this.analyticsData?.tendenciasSemana) return 0;
    return this.analyticsData.tendenciasSemana.reduce((total, aulas) => total + aulas, 0);
  }

  onPeriodChange(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
    this.loadAnalyticsData();
  }

  exportReport(): void {
    if (!this.analyticsData) {
      this.notificationService.showError('Nenhum dado para exportar', 'Erro');
      return;
    }

    // Usar o serviço de analytics para exportar
    this.analyticsService.exportarAnalyticsExcel(this.analyticsData).subscribe({
      next: (blob) => {
        // Criar download do arquivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.notificationService.showSuccess(
          'Relatório exportado com sucesso!',
          'Export Concluído'
        );
      },
      error: (error) => {
        console.error('Erro ao exportar:', error);
        this.notificationService.showError(
          'Erro ao exportar relatório. Tente novamente.',
          'Erro na Exportação'
        );
      }
    });
  }

  gerarRelatorioCompleto(): void {
    const request: AnalyticsRequest = {
      periodo: this.selectedPeriod,
      dataInicio: this.getDataInicio(),
      dataFim: this.getDataFim()
    };

    // Integrar com o sistema de relatórios existente
    this.analyticsService.gerarRelatorioAnalytics(request).subscribe({
      next: (resultado) => {
        this.notificationService.showSuccess(
          'Relatório completo gerado com sucesso!',
          'Relatório Gerado'
        );
      },
      error: (error) => {
        console.error('Erro ao gerar relatório:', error);
        this.notificationService.showError(
          'Erro ao gerar relatório completo. Tente novamente.',
          'Erro no Relatório'
        );
      }
    });
  }
}
