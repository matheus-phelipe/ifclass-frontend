import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, EstatisticasAdmin } from '../services/admin.service';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-speedometer2 me-2"></i>Dashboard Administrativo</h2>
        <div class="d-flex gap-2">
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
        <div class="col-md-3 mb-3">
          <div class="card border-primary">
            <div class="card-body text-center">
              <i class="bi bi-people-fill text-primary fs-1"></i>
              <h3 class="mt-2">{{estatisticas?.totalUsuarios || 0}}</h3>
              <p class="text-muted mb-1">Total de Usuários</p>
              <small class="text-success">
                <i class="bi bi-person-check"></i> {{estatisticas?.totalProfessores || 0}} professores
              </small>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-success">
            <div class="card-body text-center">
              <i class="bi bi-mortarboard-fill text-success fs-1"></i>
              <h3 class="mt-2">{{estatisticas?.totalCursos || 0}}</h3>
              <p class="text-muted mb-1">Cursos Ativos</p>
              <small class="text-info">
                <i class="bi bi-collection"></i> {{estatisticas?.totalTurmas || 0}} turmas
              </small>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-warning">
            <div class="card-body text-center">
              <i class="bi bi-door-open-fill text-warning fs-1"></i>
              <h3 class="mt-2">{{estatisticas?.totalSalas || 0}}</h3>
              <p class="text-muted mb-1">Salas Cadastradas</p>
              <small class="text-warning">
                <i class="bi bi-hdd"></i> {{(estatisticas?.percentualUsoMemoria || 0) | number:'1.0-1'}}% memória
              </small>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-info">
            <div class="card-body text-center">
              <i class="bi bi-clock-fill text-info fs-1"></i>
              <h3 class="mt-2">{{formatarTempo(estatisticas?.tempoOnline || 0)}}</h3>
              <p class="text-muted mb-1">Tempo Online</p>
              <small class="text-success">
                <i class="bi bi-check-circle"></i> {{estatisticas?.statusSistema || 'OFFLINE'}}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-lightning me-2"></i>Ações Rápidas
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <button class="btn btn-outline-primary w-100" routerLink="/app/usuarios">
                    <i class="bi bi-people me-2"></i>Gerenciar Usuários
                  </button>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-success w-100" routerLink="/app/admin/sistema">
                    <i class="bi bi-server me-2"></i>Monitorar Sistema
                  </button>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-warning w-100" routerLink="/app/admin/configuracoes">
                    <i class="bi bi-gear me-2"></i>Configurações
                  </button>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-info w-100" routerLink="/app/admin/logs">
                    <i class="bi bi-file-text me-2"></i>Logs do Sistema
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status do Sistema -->
      <div class="row mt-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-check-circle me-2"></i>Status do Sistema
              </h5>
            </div>
            <div class="card-body">
              <div class="alert" [class]="getStatusAlertClass()">
                <i class="bi" [class]="getStatusIconClass()"></i>
                <h5 class="mt-3" [class]="getStatusTextClass()">{{getStatusMessage()}}</h5>
                <p class="text-muted">{{getStatusDescription()}}</p>
              </div>

              <div class="row text-center">
                <div class="col-md-2">
                  <h4 class="text-primary">{{estatisticas?.totalUsuarios || 0}}</h4>
                  <small class="text-muted">Total Usuários</small>
                </div>
                <div class="col-md-2">
                  <h4 class="text-success">{{estatisticas?.totalAulas || 0}}</h4>
                  <small class="text-muted">Aulas Cadastradas</small>
                </div>
                <div class="col-md-2">
                  <h4 class="text-warning">{{estatisticas?.aulasHoje || 0}}</h4>
                  <small class="text-muted">Aulas Hoje</small>
                </div>
                <div class="col-md-2">
                  <h4 class="text-info">{{(estatisticas?.percentualUsoCPU || 0) | number:'1.0-1'}}%</h4>
                  <small class="text-muted">Uso CPU</small>
                </div>
                <div class="col-md-2">
                  <h4 class="text-secondary">{{estatisticas?.totalDisciplinas || 0}}</h4>
                  <small class="text-muted">Disciplinas</small>
                </div>
                <div class="col-md-2">
                  <h4 class="text-dark">{{estatisticas?.aulasEstaSemana || 0}}</h4>
                  <small class="text-muted">Aulas Semana</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .progress {
      border-radius: 10px;
    }
    
    .alert {
      border-left: 4px solid;
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
  `]
})
export class AdminDashboardComponent implements OnInit {
  estatisticas: EstatisticasAdmin | null = null;
  carregando = false;
  erro: string | null = null;

  constructor(private adminService: AdminService) {}

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
        alert('Sistema funcionando normalmente!');
      },
      error: (error) => {
        console.error('Erro no sistema:', error);
        alert('Erro ao verificar sistema!');
      }
    });
  }

  criarBackup(): void {
    if (confirm('Deseja criar um backup completo do sistema?')) {
      this.carregando = true;

      console.log('Iniciando backup do sistema...');

      this.adminService.criarBackup().subscribe({
        next: (response) => {
          this.carregando = false;
          const timestamp = new Date().toLocaleString('pt-BR');
          alert(`✅ Backup criado com sucesso!\n\n${response}\nData: ${timestamp}`);
          this.carregarEstatisticas(); // Recarregar dados
        },
        error: (error) => {
          this.carregando = false;
          console.error('Erro ao criar backup:', error);
          alert('❌ Erro ao criar backup. Tente novamente.');
        }
      });
    }
  }

  reiniciarServicos(): void {
    if (confirm('⚠️ Tem certeza que deseja reiniciar os serviços?\n\nIsso causará indisponibilidade temporária.')) {
      this.carregando = true;

      console.log('Reiniciando serviços do sistema...');

      setTimeout(() => {
        this.carregando = false;
        alert('✅ Serviços reiniciados com sucesso!');
        this.carregarEstatisticas(); // Recarregar dados
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
