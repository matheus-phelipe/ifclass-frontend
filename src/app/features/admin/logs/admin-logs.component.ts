import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, LogSistema } from '../services/admin.service';
import { OnDestroy } from '@angular/core';
import { LogWebsocketService } from '../services/log-websocket.service';
import { finalize, Subscription } from 'rxjs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ToastrService } from 'ngx-toastr';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule, RelativeTimePipe],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-file-text me-2"></i>Logs do Sistema</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success" (click)="exportarLogs()">
            <i class="bi bi-download me-1"></i>Exportar
          </button>
          <button class="btn btn-primary" (click)="atualizarLogs()">
            <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
          </button>
        </div>
      </div>

      <div class="alert alert-secondary">
        <p>Aqui você pode visualizar, filtrar e exportar os logs do sistema para análise e troubleshooting.</p>
      </div>

      <!-- Filtros -->
      <div class="card mb-4 ">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label class="form-label">Fonte:</label>
              <select class="form-select" [(ngModel)]="fonteSelecionada">
                <option value="">Todas</option>
                <option value="Application">Application</option>
                <option value="Security">Security</option>
                <option value="Database">Database</option>
                <option value="Network">Network</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Período:</label>
              <div class="row g-2">
                <div class="col-12">
                  <input type="date" class="form-control" [(ngModel)]="dataInicio" placeholder="Data início">
                </div>
                <div class="col-12 text-center">
                  <span class="text-muted small">até</span>
                </div>
                <div class="col-12">
                  <input type="date" class="form-control" [(ngModel)]="dataFim" placeholder="Data fim">
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Buscar:</label>
              <input type="text" class="form-control" [(ngModel)]="termoBusca" placeholder="Buscar na mensagem...">
            </div>
          </div>
        </div>
      </div>

      <!-- Estatísticas dos Logs -->
      <div class="row mb-4 ">
        <div class="col-md-3">
          <div class="card text-center border-danger" (click)="filtrarPorNivel('ERROR')" [class.active]="nivelSelecionado === 'ERROR'">
            <div class="card-body">
              <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
              <h4 class="mt-2">{{ getCountByNivel('ERROR') }}</h4>
              <p class="text-muted mb-0">Erros</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-warning"  (click)="filtrarPorNivel('WARN')" [class.active]="nivelSelecionado === 'WARN'">
            <div class="card-body">
              <i class="bi bi-exclamation-triangle text-warning fs-1"></i>
              <h4 class="mt-2">{{ getCountByNivel('WARN') }}</h4>
              <p class="text-muted mb-0">Avisos</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-info"  (click)="filtrarPorNivel('INFO')" [class.active]="nivelSelecionado === 'INFO'">
            <div class="card-body">
              <i class="bi bi-info-circle text-info fs-1"></i>
              <h4 class="mt-2">{{ getCountByNivel('INFO') }}</h4>
              <p class="text-muted mb-0">Informações</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-secondary" (click)="filtrarPorNivel('DEBUG')" [class.active]="nivelSelecionado === 'DEBUG'">
            <div class="card-body">
              <i class="bi bi-bug text-secondary fs-1"></i>
              <h4 class="mt-2">{{ getCountByNivel('DEBUG') }}</h4>
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
            <span class="badge bg-secondary ms-2">{{ logs.length }}</span>
          </h5>
      <div>
        <button class="btn "
                [ngClass]="{'btn-outline-secondary': !isPaused, 'btn-success': isPaused}"
                (click)="togglePause()">

          <i *ngIf="!isPaused" class="bi bi-pause-fill me-1"></i>

          <i *ngIf="isPaused" class="bi bi-play-fill me-1"></i>

          <span *ngIf="!isPaused">Pausar</span>

          <span *ngIf="isPaused">
            Retomar
            <span *ngIf="pausedLogs.length > 0" class="badge bg-light text-dark ms-1">{{ pausedLogs.length }}</span>
          </span>

        </button>
      </div>
        </div>
        <div class="card-body p-0">
        <div class="border rounded-bottom">
          <div class="log-header d-flex align-items-center p-2 gap 3">
              <div class="col-3">Timestamp</div>
              <div class="col-2">Nível</div>
              <div class="col-2">Fonte</div>
              <div class="col-5">Mensagem</div>
          </div>

            <cdk-virtual-scroll-viewport itemSize="50" class="log-viewport">
                <div *ngIf="carregando" class="text-center p-4 text-muted">Carregando logs...</div>
                <div *ngIf="erro && !carregando" class="text-center p-4 text-warning">{{erro}}</div>
                <div *ngIf="getLogsFiltrados().length === 0 && !carregando && !erro" class="text-center p-4 text-muted">Nenhum log encontrado...</div>

          <ng-container *cdkVirtualFor="let log of getLogsFiltrados(); trackBy: trackByLogId">

            <div class="row p-2 mx-0 border-top log-row align-items-center"
              (click)="toggleExpand(log.id)"
              [class.active-log]="expandedLogId === log.id"
              [ngClass]="getLogRowClass(log.timestamp)">

              <div class="col-3 text-truncate">
                <small [title]="log.timestamp | date:'dd/MM/yyyy HH:mm:ss'">
                  {{log.timestamp | relativeTime}}
                </small>
              </div>
              <div class="col-2">
                  <span class="badge" [class]="getNivelClass(log.nivel)">{{log.nivel}}</span>
              </div>
              <div class="col-2 text-truncate">
                  <small class="text-muted">{{log.categoria}}</small>
              </div>
              <div class="col-5 text-truncate">
                  <span>{{ getCompactMessage(log.mensagem) }}</span>
              </div>
          </div>

            <div *ngIf="expandedLogId === log.id" class="log-details p-3 border-top">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>Detalhes do Log:</strong>
                  <button class="btn border-0 "
                          [ngClass]="{'btn-outline-secondary': logCopiadoId !== log.id, 'btn-success': logCopiadoId === log.id}"
                          (click)="copiarLog(log)">

                      <span *ngIf="logCopiadoId !== log.id">
                          <i class="bi bi-clipboard "></i>
                      </span>
                      <span *ngIf="logCopiadoId === log.id">
                          <i class="bi bi-check-lg "></i>
                      </span>
                  </button>
              </div>
              <pre class="mb-2" >{{ log.mensagem.replaceAll(' | ', '\n') }}</pre>

              <div class="d-flex justify-content-between">
                <small class="text-muted"><strong>Fonte:</strong> {{log.categoria}}</small>
                <small class="text-muted" *ngIf="log.usuario !== 'system'">
                    <strong>Usuário:</strong> {{log.usuario}} | <strong>IP:</strong> {{log.ip}}
                </small>
                <small class="text-muted" *ngIf="log.detalhes">
                    <strong>Detalhes:</strong> {{log.detalhes}}
                </small>
              </div>
            </div>

          </ng-container>
            </cdk-virtual-scroll-viewport>
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

    .card {
      cursor: pointer;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    small {
      transition: color 0.3s ease-in-out;
    }

    .log-row {
      transition: background-color 0.5s ease-in-out;
    }

    .log-row-fresh {
      background-color: #E0F2E0;
    }

    .log-row-recent {
      background-color: #F5F6FA;
    }

    .log-row:hover, .log-row.active-log {
       background-color: #f1f3f5;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .card.border-danger.active {
      background-color: #dc3545; /* Vermelho do Bootstrap */
      color: white; /* Cor do texto e do número */
      border-color: #a71d2a;
    }

    .card.border-danger.active .text-danger,
    .card.border-danger.active .text-muted {
      color: white !important;
    }

    .card.border-warning.active {
      background-color: #ffc107; /* Amarelo do Bootstrap */
      color: white; /* Texto escuro para melhor contraste */
      border-color: #d9a406;
    }
    .card.border-warning.active .text-warning,
    .card.border-warning.active .text-muted {
      color: white !important;
    }

    .card.border-info.active {
      background-color: #0dcaf0; /* Azul claro do Bootstrap */
      color: white;
      border-color: #0aa3c2;
    }
    .card.border-info.active .text-info,
    .card.border-info.active .text-muted {
      color: white !important;
    }

    .card.border-secondary.active {
      background-color: #6c757d; /* Cinza do Bootstrap */
      color: white;
      border-color: #545b62;
    }
    .card.border-secondary.active .text-secondary,
    .card.border-secondary.active .text-muted {
      color: white !important;
    }

    .log-viewport {
      height: 500px;
    }

    .log-row {
      cursor: pointer;
    }

    .log-row:hover, .log-row.active-log {
      background-color: #f1f3f5;
    }

    /* Estilos para a área de detalhes */
    .log-details {
      background-color: #f8f9fa;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .log-details pre {
      white-space: pre-wrap;
      word-break: break-all;
      margin: 0;
      font-size: 0.875em;
      color: #495057;
      background-color: #e9ecef;
      padding: 0.5rem;
      border-radius: 0.25rem;
    }

    /* Estilos para campos de data */
    input[type="date"] {
      width: 100%;
      font-size: 0.9rem;
    }

    .form-label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class AdminLogsComponent implements OnInit, OnDestroy {
  logs: LogSistema[] = [];
  carregando = false;
  erro: string | null = null;
  isPaused = false;
  pausedLogs: LogSistema[] = [];
  filteredLogs: LogSistema[] = [];
  expandedLogId: number | null = null;
  logCopiadoId: number | null = null;
  isExporting = false;

  nivelSelecionado = '';
  fonteSelecionada = '';
  dataInicio: string = '';
  dataFim: string = '';
  termoBusca = '';

  private wsLogContador = 0;
  private logSubscription!: Subscription;

  constructor(private adminService: AdminService, private logWebsocketService: LogWebsocketService,  private cdr: ChangeDetectorRef, private toastr: ToastrService) {
    // Obter a data atual
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const todayString = `${year}-${month}-${day}`;
    this.dataInicio = todayString;
    this.dataFim = todayString;
  }

  ngOnInit(): void {
    this.carregarLogs(); // Continua carregando o histórico inicial
    this.conectarWebSocket(); // Inicia a escuta por logs em tempo real
  }

  ngOnDestroy(): void {
    // Cancela a inscrição e desconecta do WebSocket para não consumir recursos
    if (this.logSubscription) {
      this.logSubscription.unsubscribe();
    }
    this.logWebsocketService.disconnect();
  }

  conectarWebSocket(): void {
      this.logWebsocketService.connect();
      this.logSubscription = this.logWebsocketService.log$.subscribe({
        next: (novoLog: LogSistema) => {
          if (novoLog.id === null || novoLog.id === undefined) {
            this.wsLogContador--;
            novoLog.id = this.wsLogContador;
          }

          if (this.isPaused) {
            this.pausedLogs.push(novoLog);
          } else {
             this.applyFilters();
            this.logs.unshift(novoLog);
          }
        }
      });
    }

    applyFilters(): void {
    const logsFiltrados = this.logs.filter(log => {
      const matchNivel = !this.nivelSelecionado || log.nivel === this.nivelSelecionado;
      const matchFonte = !this.fonteSelecionada || log.categoria === this.fonteSelecionada;
      const matchTermo = !this.termoBusca || log.mensagem.toLowerCase().includes(this.termoBusca.toLowerCase()) || (log.usuario && log.usuario.toLowerCase().includes(this.termoBusca.toLowerCase()));

      const logDate = new Date(log.timestamp);
      const matchInicio = !this.dataInicio || logDate >= new Date(this.dataInicio);
      let matchFim = true;
      if (this.dataFim) {
        const dataFimAjustada = new Date(this.dataFim);
        dataFimAjustada.setDate(dataFimAjustada.getDate() + 1);
        matchFim = logDate < dataFimAjustada;
      }
      return matchNivel && matchFonte && matchTermo && matchInicio && matchFim;
    });
    this.filteredLogs = logsFiltrados;
  }

  carregarLogs(): void {
    this.carregando = true;
    this.erro = null;
    this.expandedLogId = null;
    this.logCopiadoId = null;

    this.adminService.getLogsSistema().subscribe({
      next: (logs) => {
        if (this.logs.length === 0) {
          this.logs = logs;
        } else {
          const logsAtuaisIds = new Set(this.logs.map(l => l.id));
          const novosLogs = logs.filter(logNovo => !logsAtuaisIds.has(logNovo.id));

          if (novosLogs.length > 0) {
            this.logs = [...novosLogs, ...this.logs];
          }
        }
        this.applyFilters();
        this.carregando = false;
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

  togglePause(): void {
    this.isPaused = !this.isPaused;
    // Se estamos retomando adiciona os logs posterior ao pause
    if (!this.isPaused && this.pausedLogs.length > 0) {
      this.logs.unshift(...this.pausedLogs);
      this.pausedLogs = [];
    }
  }

  toggleExpand(logId: number): void {
    if (this.expandedLogId === logId) {
      // Se o log clicado já está aberto, fecha-o.
      this.expandedLogId = null;
    } else {
      // Se um novo log for clicado, abre-o.
      this.expandedLogId = logId;
    }
    this.cdr.detectChanges();
  }

  trackByLogId(index: number, log: LogSistema): number {
    return log.id;
  }

  exportarLogs(): void {
      // Monta um objeto com todos os valores atuais dos filtros
      const filtros = {
        dataInicio: this.dataInicio,
        dataFim: this.dataFim,
        nivelSelecionado: this.nivelSelecionado,
        fonteSelecionada: this.fonteSelecionada,
        termoBusca: this.termoBusca
      };

        this.isExporting = true;
        this.toastr.info('Iniciando a exportação dos logs...', 'Aguarde');


      this.adminService.exportarLogs(filtros).pipe(
        finalize(() => this.isExporting = false)
    ).subscribe({
        next: (data: Blob) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `logs_filtrados_${new Date().toISOString().split('T')[0]}.xlsx`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.toastr.success('Logs exportados com sucesso!', 'Download Iniciado');
        },
        error: (err) => {
          console.error("Erro ao exportar logs:", err);
          this.toastr.error('Ocorreu um erro ao exportar os logs.', 'Falha na Exportação');
        }
      });
    }

  getLogsFiltrados(): LogSistema[] {
    return this.logs.filter(log => {
      const matchNivel = !this.nivelSelecionado || log.nivel === this.nivelSelecionado;
      const matchFonte = !this.fonteSelecionada || log.categoria === this.fonteSelecionada;
      const matchTermo = !this.termoBusca ||
        log.mensagem.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        (log.usuario && log.usuario.toLowerCase().includes(this.termoBusca.toLowerCase()));

      const logDate = new Date(log.timestamp);
      const matchInicio = !this.dataInicio || logDate >= new Date(`${this.dataInicio}T00:00:00`);

      let matchFim = true;
      if (this.dataFim) {
        const dataFimAjustada = new Date(`${this.dataFim}T00:00:00`);
        dataFimAjustada.setDate(dataFimAjustada.getDate() + 1);
        matchFim = logDate < dataFimAjustada;
      }

      return matchNivel && matchFonte && matchTermo && matchInicio && matchFim;
    });
  }

  getCountByNivel(nivel: string): number {
    return this.logs.filter(log => log.nivel === nivel).length;
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

  filtrarPorNivel(nivel: string): void {
    if (this.nivelSelecionado === nivel) {
      this.nivelSelecionado = '';
    } else {
      this.nivelSelecionado = nivel;
    }
  }

  getRowClass(nivel: string): string {
    switch (nivel) {
      case 'ERROR': return 'table-danger';
      case 'WARN': return 'table-warning';
      default: return '';
    }
  }

  getCompactMessage(message: string): string {
    if (!message) {
      return '';
    }
    const cleanMessage = message.includes(' - ') ? message.split(' - ')[1] : message;

    const mainPart = cleanMessage.split(' | ')[0];

    const maxLength = 50;
    if (mainPart.length > maxLength) {
      return mainPart.substring(0, maxLength) + '...';
    }

    return mainPart;
  }

  copiarLog(log: LogSistema): void {
    navigator.clipboard.writeText(log.mensagem).then(() => {
      this.logCopiadoId = log.id;
      setTimeout(() => {
        this.logCopiadoId = null;
      }, 1500);

    }).catch(err => {
      console.error('Erro ao copiar o log para a área de transferência: ', err);
    });
  }

  // ... dentro da classe AdminLogsComponent

  getLogRowClass(timestamp: string): string {
    const logDate = new Date(timestamp);
    const now = new Date();

    // Calcula a diferença em segundos
    const diffInSeconds = (now.getTime() - logDate.getTime()) / 1000;

    if (diffInSeconds < 60) { // Menos de 1 minuto
        return 'log-row-fresh';
    }

    if (diffInSeconds < 3600) { // Menos de 1 hora
        return 'log-row-recent';
    }

    return '';
  }
}
