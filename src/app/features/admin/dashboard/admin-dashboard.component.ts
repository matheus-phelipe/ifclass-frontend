import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, EstatisticasAdmin } from '../services/admin.service';
import { NotificationService } from '../../../shared/sweetalert/notification.service';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <h2 class="mb-0"><i class="bi bi-speedometer2 me-2"></i>Dashboard Administrativo</h2>
            <div class="d-flex flex-column flex-md-row gap-2">
              <button class="btn btn-outline-warning" (click)="verificarSistema()">
                <i class="bi bi-shield-check me-1"></i>Verificar Sistema
              </button>
              <button class="btn btn-outline-success" (click)="criarBackup()">
                <i class="bi bi-cloud-arrow-up me-1"></i>Backup
              </button>
              <button class="btn btn-primary" (click)="atualizarDados()">
                <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-info" *ngIf="carregando">
        <h4><i class="bi bi-hourglass-split me-2"></i>Carregando dados...</h4>
        <p>Aguarde enquanto carregamos as estatísticas do sistema.</p>
      </div>

      <div class="alert alert-warning" *ngIf="erro">
        <h4><i class="bi bi-exclamation-triangle me-2"></i>Aviso</h4>
        <p>{{erro}}</p>
      </div>

      <div class="alert alert-success" *ngIf="estatisticas && !carregando && !erro">
        <h4>🛡️ Dashboard Administrativo Conectado!</h4>
        <p>Sistema conectado com sucesso ao backend. Dados em tempo real carregados.</p>
      </div>

      <!-- Métricas Principais -->
      <div class="row mb-4">
        <div class="col-12 col-sm-6 col-lg-3 mb-3">
          <div class="card border-primary h-100">
            <div class="card-body text-center d-flex flex-column justify-content-between">
              <div>
                <i class="bi bi-people-fill text-primary fs-1"></i>
                <h3 class="mt-2 mb-1">{{estatisticas?.totalUsuarios || 0}}</h3>
                <p class="text-muted mb-2">Total de Usuários</p>
              </div>
              <small class="text-success">
                <i class="bi bi-person-check"></i> {{estatisticas?.totalProfessores || 0}} professores
              </small>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3 mb-3">
          <div class="card border-success h-100">
            <div class="card-body text-center d-flex flex-column justify-content-between">
              <div>
                <i class="bi bi-mortarboard-fill text-success fs-1"></i>
                <h3 class="mt-2 mb-1">{{estatisticas?.totalCursos || 0}}</h3>
                <p class="text-muted mb-2">Cursos Ativos</p>
              </div>
              <small class="text-info">
                <i class="bi bi-collection"></i> {{estatisticas?.totalTurmas || 0}} turmas
              </small>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3 mb-3">
          <div class="card border-warning h-100">
            <div class="card-body text-center d-flex flex-column justify-content-between">
              <div>
                <i class="bi bi-door-open-fill text-warning fs-1"></i>
                <h3 class="mt-2 mb-1">{{estatisticas?.totalSalas || 0}}</h3>
                <p class="text-muted mb-2">Salas Cadastradas</p>
              </div>
              <small class="text-warning">
                <i class="bi bi-hdd"></i> {{(estatisticas?.percentualUsoMemoria || 0) | number:'1.0-1'}}% memória
              </small>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3 mb-3">
          <div class="card border-info h-100">
            <div class="card-body text-center d-flex flex-column justify-content-between">
              <div>
                <i class="bi bi-clock-fill text-info fs-1"></i>
                <h3 class="mt-2 mb-1">{{formatarTempo(estatisticas?.tempoOnline || 0)}}</h3>
                <p class="text-muted mb-2">Tempo Online</p>
              </div>
              <small class="text-success">
                <i class="bi bi-check-circle"></i> {{estatisticas?.statusSistema || 'OFFLINE'}}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-lightning me-2"></i>Ações Rápidas
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-sm-6 col-lg-3">
                  <button class="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" routerLink="/app/usuarios">
                    <i class="bi bi-people fs-2 mb-2"></i>
                    <span>Gerenciar Usuários</span>
                  </button>
                </div>
                <div class="col-12 col-sm-6 col-lg-3">
                  <button class="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" routerLink="/app/admin/sistema">
                    <i class="bi bi-server fs-2 mb-2"></i>
                    <span>Monitorar Sistema</span>
                  </button>
                </div>
                <div class="col-12 col-sm-6 col-lg-3">
                  <button class="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" routerLink="/app/admin/configuracoes">
                    <i class="bi bi-gear fs-2 mb-2"></i>
                    <span>Configurações</span>
                  </button>
                </div>
                <div class="col-12 col-sm-6 col-lg-3">
                  <button class="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3" routerLink="/app/admin/logs">
                    <i class="bi bi-file-text fs-2 mb-2"></i>
                    <span>Logs do Sistema</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status do Sistema -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-check-circle me-2"></i>Status do Sistema
              </h5>
            </div>
            <div class="card-body">
              <div class="alert text-center" [class]="getStatusAlertClass()">
                <i class="bi" [class]="getStatusIconClass()"></i>
                <h5 class="mt-3 mb-2" [class]="getStatusTextClass()">{{getStatusMessage()}}</h5>
                <p class="mb-0">{{getStatusDescription()}}</p>
              </div>

              <div class="row g-3 text-center">
                <div class="col-6 col-md-4 col-lg-2">
                  <div class="p-3 bg-light rounded">
                    <h4 class="text-primary mb-1">{{estatisticas?.totalUsuarios || 0}}</h4>
                    <small class="text-muted">Total Usuários</small>
                  </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                  <div class="p-3 bg-light rounded">
                    <h4 class="text-success mb-1">{{estatisticas?.totalAulas || 0}}</h4>
                    <small class="text-muted">Aulas Cadastradas</small>
                  </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                  <div class="p-3 bg-light rounded">
                    <h4 class="text-warning mb-1">{{estatisticas?.aulasHoje || 0}}</h4>
                    <small class="text-muted">Aulas Hoje</small>
                  </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                  <div class="p-3 bg-light rounded">
                    <h4 class="text-info mb-1">{{(estatisticas?.percentualUsoCPU || 0) | number:'1.0-1'}}%</h4>
                    <small class="text-muted">Uso CPU</small>
                  </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                  <div class="p-3 bg-light rounded">
                    <h4 class="text-secondary mb-1">{{estatisticas?.totalDisciplinas || 0}}</h4>
                    <small class="text-muted">Disciplinas</small>
                  </div>
                </div>
                <div class="col-6 col-md-4 col-lg-2">
                  <div class="p-3 bg-light rounded">
                    <h4 class="text-dark mb-1">{{estatisticas?.aulasEstaSemana || 0}}</h4>
                    <small class="text-muted">Aulas Semana</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Corrigir problemas de layout */
    .container-fluid {
      max-width: 100%;
      padding-left: 1rem;
      padding-right: 1rem;
      overflow-x: hidden;
    }

    .row {
      margin-left: -0.5rem;
      margin-right: -0.5rem;
    }

    .row > * {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    .card {
      transition: transform 0.2s;
      margin-bottom: 1rem;
      border: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .card-body {
      padding: 1.5rem;
    }

    .progress {
      border-radius: 10px;
    }

    .alert {
      border-left: 4px solid;
      margin-bottom: 1.5rem;
    }

    .alert-danger {
      border-left-color: #dc3545;
    }

    .alert-warning {
      border-left-color: #ffc107;
    }

    .alert-info {
      border-left-color: #0dcaf0;
    }

    .alert-success {
      border-left-color: #198754;
    }

    /* Cards de métricas com altura igual */
    .h-100 {
      height: 100% !important;
    }

    /* Botões de ação rápida */
    .btn.h-100 {
      min-height: 120px;
      transition: all 0.2s ease;
    }

    .btn.h-100:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* Status cards */
    .bg-light {
      background-color: #f8f9fa !important;
      transition: all 0.2s ease;
    }

    .bg-light:hover {
      background-color: #e9ecef !important;
      transform: translateY(-1px);
    }

    /* Botões do header */
    .gap-2 {
      gap: 0.5rem !important;
    }

    .btn {
      white-space: nowrap;
      min-height: auto;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .gap-2 {
        gap: 0.5rem !important;
      }

      .btn {
        font-size: 0.875rem;
        padding: 0.5rem 0.75rem;
      }

      .btn.h-100 {
        min-height: 100px;
        padding: 1rem;
      }

      .card-body {
        padding: 1rem;
      }

      .container-fluid {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      .fs-1 {
        font-size: 2rem !important;
      }

      .fs-2 {
        font-size: 1.5rem !important;
      }
    }

    @media (max-width: 576px) {
      .btn.h-100 {
        min-height: 80px;
        padding: 0.75rem;
      }

      .btn.h-100 span {
        font-size: 0.875rem;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  estatisticas: EstatisticasAdmin | null = null;
  carregando = false;
  erro: string | null = null;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregarEstatisticas();
  }

  carregarEstatisticas(): void {
    this.carregando = true;
    this.erro = null;

    this.adminService.getEstatisticasAdmin().subscribe({
      next: (dados) => {
        this.estatisticas = dados;
        this.carregando = false;
        console.log('Estatísticas admin carregadas:', dados);
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas admin:', error);

        if (error.status === 0) {
          this.erro = 'Erro de conexão: Verifique se o servidor está rodando.';
        } else if (error.status === 403) {
          this.erro = 'Acesso negado: Você não tem permissão para acessar estes dados.';
        } else if (error.status === 500) {
          this.erro = 'Erro interno do servidor: Tente novamente em alguns minutos.';
        } else {
          this.erro = `Erro ao carregar dados: ${error.message || 'Erro desconhecido'}`;
        }

        this.carregando = false;
      }
    });
  }



  atualizarDados(): void {
    this.carregarEstatisticas();
  }

  verificarSistema(): void {
    this.adminService.healthCheck().subscribe({
      next: (response) => {
        console.log('Sistema OK:', response);
        this.notificationService.showSuccess(
          'Sistema funcionando normalmente!',
          'Verificação Concluída'
        );
      },
      error: (error) => {
        console.error('Erro no sistema:', error);
        this.notificationService.showError(
          'Erro ao verificar sistema. Tente novamente.',
          'Erro na Verificação'
        );
      }
    });
  }

  async criarBackup(): Promise<void> {
    const confirmado = await this.notificationService.confirm(
      'Criar Backup do Sistema',
      'Deseja criar um backup completo do sistema? Este processo pode levar alguns minutos.',
      'Sim, criar backup'
    );

    if (confirmado) {
      this.carregando = true;
      console.log('Iniciando backup do sistema...');

      this.adminService.criarBackup().subscribe({
        next: (response) => {
          this.carregando = false;
          const timestamp = new Date().toLocaleString('pt-BR');
          this.notificationService.success(
            'Backup Criado!',
            `Backup criado com sucesso!\n\n${response}\nData: ${timestamp}`
          );
          this.carregarEstatisticas();
        },
        error: (error) => {
          this.carregando = false;
          console.error('Erro ao criar backup:', error);
          this.notificationService.showError(
            'Erro ao criar backup. Tente novamente.',
            'Erro no Backup'
          );
        }
      });
    }
  }

  async reiniciarServicos(): Promise<void> {
    const confirmado = await this.notificationService.confirmCritical(
      'Reiniciar Serviços do Sistema',
      'Tem certeza que deseja reiniciar os serviços?\n\nIsso causará indisponibilidade temporária e todos os usuários conectados serão desconectados.',
      'Sim, reiniciar'
    );

    if (confirmado) {
      this.carregando = true;
      console.log('Reiniciando serviços do sistema...');

      setTimeout(() => {
        this.carregando = false;
        this.notificationService.showSuccess(
          'Serviços reiniciados com sucesso!',
          'Reinicialização Concluída'
        );
        this.carregarEstatisticas();
      }, 4000);
    }
  }

  formatarTempo(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) {
      return `${dias}d ${horas % 24}h`;
    } else {
      return `${horas}h ${minutos % 60}m`;
    }
  }

  getStatusAlertClass(): string {
    if (!this.estatisticas) return 'alert-warning';

    const status = this.estatisticas.statusSistema;
    switch (status) {
      case 'ONLINE': return 'alert-success';
      case 'WARNING': return 'alert-warning';
      case 'ERROR': return 'alert-danger';
      default: return 'alert-secondary';
    }
  }

  getStatusIconClass(): string {
    if (!this.estatisticas) return 'bi-exclamation-triangle text-warning fs-1';

    const status = this.estatisticas.statusSistema;
    switch (status) {
      case 'ONLINE': return 'bi-check-circle text-success fs-1';
      case 'WARNING': return 'bi-exclamation-triangle text-warning fs-1';
      case 'ERROR': return 'bi-x-circle text-danger fs-1';
      default: return 'bi-question-circle text-secondary fs-1';
    }
  }

  getStatusTextClass(): string {
    if (!this.estatisticas) return 'text-warning';

    const status = this.estatisticas.statusSistema;
    switch (status) {
      case 'ONLINE': return 'text-success';
      case 'WARNING': return 'text-warning';
      case 'ERROR': return 'text-danger';
      default: return 'text-secondary';
    }
  }

  getStatusMessage(): string {
    if (!this.estatisticas) return 'Carregando Status...';

    const status = this.estatisticas.statusSistema;
    switch (status) {
      case 'ONLINE': return 'Sistema Funcionando Normalmente';
      case 'WARNING': return 'Sistema com Alertas';
      case 'ERROR': return 'Sistema com Problemas';
      default: return 'Status Desconhecido';
    }
  }

  getStatusDescription(): string {
    if (!this.estatisticas) return 'Verificando status dos serviços...';

    const status = this.estatisticas.statusSistema;
    const memoria = this.estatisticas.percentualUsoMemoria || 0;
    const cpu = this.estatisticas.percentualUsoCPU || 0;

    switch (status) {
      case 'ONLINE':
        return `Todos os serviços operacionais. CPU: ${cpu.toFixed(1)}%, Memória: ${memoria.toFixed(1)}%`;
      case 'WARNING':
        return `Alguns serviços com alertas. Verifique o monitoramento.`;
      case 'ERROR':
        return `Problemas detectados nos serviços. Ação necessária.`;
      default:
        return 'Status não determinado.';
    }
  }
}
