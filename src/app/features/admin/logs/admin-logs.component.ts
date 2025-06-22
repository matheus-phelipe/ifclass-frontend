import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, LogSistema } from '../services/admin.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-file-text me-2"></i>Logs do Sistema</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success" (click)="exportarLogs()">
            <i class="bi bi-download me-1"></i>Exportar
          </button>
          <button class="btn btn-outline-warning" (click)="limparLogs()">
            <i class="bi bi-trash me-1"></i>Limpar Antigos
          </button>
          <button class="btn btn-primary" (click)="atualizarLogs()">
            <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
          </button>
        </div>
      </div>

      <div class="alert alert-secondary">
        <h4>📋 Logs do Sistema</h4>
        <p>Aqui você pode visualizar, filtrar e exportar os logs do sistema para análise e troubleshooting.</p>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <label class="form-label">Nível do Log:</label>
              <select class="form-select" [(ngModel)]="nivelSelecionado">
                <option value="">Todos</option>
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Fonte:</label>
              <select class="form-select" [(ngModel)]="fonteSelecionada">
                <option value="">Todas</option>
                <option value="Application">Application</option>
                <option value="Security">Security</option>
                <option value="Database">Database</option>
                <option value="Network">Network</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Data:</label>
              <input type="date" class="form-control" [(ngModel)]="dataSelecionada">
            </div>
            <div class="col-md-3">
              <label class="form-label">Buscar:</label>
              <input type="text" class="form-control" [(ngModel)]="termoBusca" placeholder="Buscar na mensagem...">
            </div>
          </div>
        </div>
      </div>

      <!-- Estatísticas dos Logs -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center border-danger">
            <div class="card-body">
              <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
              <h4 class="mt-2">12</h4>
              <p class="text-muted mb-0">Erros</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-warning">
            <div class="card-body">
              <i class="bi bi-exclamation-triangle text-warning fs-1"></i>
              <h4 class="mt-2">45</h4>
              <p class="text-muted mb-0">Avisos</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-info">
            <div class="card-body">
              <i class="bi bi-info-circle text-info fs-1"></i>
              <h4 class="mt-2">1,247</h4>
              <p class="text-muted mb-0">Informações</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-secondary">
            <div class="card-body">
              <i class="bi bi-bug text-secondary fs-1"></i>
              <h4 class="mt-2">856</h4>
              <p class="text-muted mb-0">Debug</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Logs -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-list-ul me-2"></i>Logs do Sistema
            <span class="badge bg-secondary ms-2">2,160</span>
          </h5>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="autoRefresh" [(ngModel)]="autoRefresh">
            <label class="form-check-label" for="autoRefresh">
              Auto-atualizar
            </label>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
            <table class="table table-sm mb-0">
              <thead class="table-light sticky-top">
                <tr>
                  <th>Timestamp</th>
                  <th>Nível</th>
                  <th>Fonte</th>
                  <th>Mensagem</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="carregando">
                  <td colspan="4" class="text-center py-4">
                    <i class="bi bi-hourglass-split me-2"></i>Carregando logs...
                  </td>
                </tr>

                <tr *ngIf="erro && !carregando">
                  <td colspan="4" class="text-center py-4 text-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>{{erro}}
                  </td>
                </tr>

                <tr *ngIf="getLogsFiltrados().length === 0 && !carregando && !erro">
                  <td colspan="4" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox me-2"></i>Nenhum log encontrado com os filtros aplicados
                  </td>
                </tr>

                <tr *ngFor="let log of getLogsFiltrados()" [class]="getRowClass(log.nivel)">
                  <td><small>{{log.timestamp | date:'dd/MM/yyyy HH:mm:ss'}}</small></td>
                  <td><span class="badge" [class]="getNivelClass(log.nivel)">{{log.nivel}}</span></td>
                  <td><small class="text-muted">{{log.categoria}}</small></td>
                  <td>
                    {{log.mensagem}}
                    <small class="text-muted d-block" *ngIf="log.usuario !== 'system'">
                      Usuário: {{log.usuario}} | IP: {{log.ip}}
                    </small>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Informações -->
      <div class="alert alert-info mt-4">
        <h6 class="alert-heading">
          <i class="bi bi-info-circle me-2"></i>Informações sobre Logs
        </h6>
        <ul class="mb-0">
          <li>Os logs são atualizados em tempo real quando o auto-refresh está ativado.</li>
          <li>Use os filtros para encontrar logs específicos mais rapidamente.</li>
          <li>Logs antigos são automaticamente removidos após 30 dias.</li>
          <li>A exportação inclui todos os logs filtrados no período selecionado.</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .table-responsive {
      border-radius: 0.375rem;
    }
    
    .sticky-top {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .table-danger {
      background-color: rgba(220, 53, 69, 0.1);
    }
    
    .table-warning {
      background-color: rgba(255, 193, 7, 0.1);
    }
  `]
})
export class AdminLogsComponent implements OnInit {
  logs: LogSistema[] = [];
  carregando = false;
  erro: string | null = null;

  nivelSelecionado = '';
  fonteSelecionada = '';
  dataSelecionada = '';
  termoBusca = '';
  autoRefresh = false;
  private refreshInterval: any;

  constructor(private adminService: AdminService) {
    // Definir data padrão como hoje
    this.dataSelecionada = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.carregarLogs();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  carregarLogs(): void {
    this.carregando = true;
    this.erro = null;

    this.adminService.getLogsSistema().subscribe({
      next: (logs) => {
        this.logs = logs;
        this.carregando = false;
        console.log('Logs carregados:', logs);
      },
      error: (error) => {
        console.error('Erro ao carregar logs:', error);

        if (error.status === 0) {
          this.erro = 'Erro de conexão: Servidor indisponível.';
        } else if (error.status === 403) {
          this.erro = 'Acesso negado: Permissões insuficientes para visualizar logs.';
        } else if (error.status === 500) {
          this.erro = 'Erro interno: Falha ao recuperar logs do sistema.';
        } else {
          this.erro = `Erro ao carregar logs: ${error.message || 'Erro desconhecido'}`;
        }

        this.carregando = false;
        this.logs = [];
      }
    });
  }



  atualizarLogs(): void {
    this.carregarLogs();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;

    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.carregarLogs();
      }, 30000); // Atualizar a cada 30 segundos
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    }
  }

  exportarLogs(): void {
    const logsFiltrados = this.getLogsFiltrados();

    if (logsFiltrados.length === 0) {
      alert('Nenhum log para exportar com os filtros aplicados.');
      return;
    }

    // Criar CSV
    const headers = ['Timestamp', 'Nível', 'Categoria', 'Mensagem', 'Usuário', 'IP', 'Detalhes'];
    const csvContent = [
      headers.join(','),
      ...logsFiltrados.map(log => [
        log.timestamp,
        log.nivel,
        log.categoria,
        `"${log.mensagem.replace(/"/g, '""')}"`,
        log.usuario,
        log.ip,
        `"${log.detalhes.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `logs_sistema_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Exportados ${logsFiltrados.length} logs para CSV`);
    alert(`${logsFiltrados.length} logs exportados com sucesso!`);
  }

  limparLogs(): void {
    if (confirm('Tem certeza que deseja limpar os logs antigos? Esta ação não pode ser desfeita.')) {
      // Em um sistema real, isso faria uma chamada para o backend
      // Por enquanto, vamos simular a limpeza
      this.carregando = true;

      // Simular delay de processamento
      setTimeout(() => {
        // Manter apenas logs das últimas 2 horas (simulação)
        const duasHorasAtras = new Date();
        duasHorasAtras.setHours(duasHorasAtras.getHours() - 2);

        const logsRecentes = this.logs.filter(log =>
          new Date(log.timestamp) > duasHorasAtras
        );

        const logsRemovidos = this.logs.length - logsRecentes.length;
        this.logs = logsRecentes;
        this.carregando = false;

        console.log(`${logsRemovidos} logs antigos removidos`);
        alert(`${logsRemovidos} logs antigos removidos com sucesso!`);
      }, 1500);
    }
  }

  getLogsFiltrados(): LogSistema[] {
    return this.logs.filter(log => {
      const matchNivel = !this.nivelSelecionado || log.nivel === this.nivelSelecionado;
      const matchFonte = !this.fonteSelecionada || log.categoria === this.fonteSelecionada;
      const matchTermo = !this.termoBusca ||
        log.mensagem.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        log.usuario.toLowerCase().includes(this.termoBusca.toLowerCase());

      return matchNivel && matchFonte && matchTermo;
    });
  }

  getNivelClass(nivel: string): string {
    switch (nivel) {
      case 'ERROR': return 'bg-danger';
      case 'WARN': return 'bg-warning text-dark';
      case 'INFO': return 'bg-info';
      case 'DEBUG': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  getRowClass(nivel: string): string {
    switch (nivel) {
      case 'ERROR': return 'table-danger';
      case 'WARN': return 'table-warning';
      default: return '';
    }
  }
}
