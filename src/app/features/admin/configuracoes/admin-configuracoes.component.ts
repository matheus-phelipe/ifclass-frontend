import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../shared/sweetalert/notification.service';

@Component({
  selector: 'app-admin-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-gear me-2"></i>Configurações do Sistema</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-warning" (click)="resetarTodasConfiguracoes()">
            <i class="bi bi-arrow-clockwise me-1"></i>Resetar Todas
          </button>
          <button class="btn btn-success" (click)="salvarConfiguracoes()">
            <i class="bi bi-check-lg me-1"></i>Salvar Alterações
          </button>
          <button class="btn btn-primary" (click)="atualizarConfiguracoes()">
            <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
          </button>
        </div>
      </div>

      <div class="alert alert-warning">
        <h4>⚙️ Configurações do Sistema</h4>
        <p>Aqui você pode gerenciar as configurações globais do sistema. Tenha cuidado ao alterar valores críticos.</p>
      </div>

      <!-- Filtros por Categoria -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Filtrar por Categoria:</label>
              <select class="form-select" [(ngModel)]="categoriaFiltro">
                <option value="">Todas as Categorias</option>
                <option value="Geral">Geral</option>
                <option value="Segurança">Segurança</option>
                <option value="Backup">Backup</option>
                <option value="Email">Email</option>
                <option value="Database">Database</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Buscar Configuração:</label>
              <input type="text" class="form-control" [(ngModel)]="buscaFiltro" placeholder="Nome ou descrição...">
            </div>
          </div>
        </div>
      </div>

      <!-- Configurações Gerais -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-gear-fill me-2"></i>Configurações Gerais
            <span class="badge bg-secondary ms-2">4</span>
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card border-primary">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">app.name</h6>
                    <span class="badge bg-primary">STRING</span>
                  </div>
                  <p class="card-text small text-muted mb-3">Nome da aplicação</p>
                  <input type="text" class="form-control form-control-sm" [(ngModel)]="configs.appName" value="IFClass">
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <div class="card border-secondary">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">app.version</h6>
                    <div class="d-flex gap-1">
                      <span class="badge bg-primary">STRING</span>
                      <span class="badge bg-secondary" title="Somente leitura">
                        <i class="bi bi-lock"></i>
                      </span>
                    </div>
                  </div>
                  <p class="card-text small text-muted mb-3">Versão da aplicação</p>
                  <input type="text" class="form-control form-control-sm" value="1.0.3" disabled>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Configurações de Segurança -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-shield-fill me-2"></i>Configurações de Segurança
            <span class="badge bg-secondary ms-2">3</span>
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card border-primary">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">security.session.timeout</h6>
                    <span class="badge bg-success">NUMBER</span>
                  </div>
                  <p class="card-text small text-muted mb-3">Timeout da sessão em segundos</p>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="configs.sessionTimeout" value="3600">
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <div class="card border-primary">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">security.max.login.attempts</h6>
                    <span class="badge bg-success">NUMBER</span>
                  </div>
                  <p class="card-text small text-muted mb-3">Máximo de tentativas de login</p>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="configs.maxLoginAttempts" value="5">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Configurações de Backup -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-cloud-arrow-up-fill me-2"></i>Configurações de Backup
            <span class="badge bg-secondary ms-2">2</span>
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card border-primary">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">backup.automatic.enabled</h6>
                    <span class="badge bg-warning text-dark">BOOLEAN</span>
                  </div>
                  <p class="card-text small text-muted mb-3">Habilitar backup automático</p>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" [(ngModel)]="configs.backupEnabled" [checked]="configs.backupEnabled">
                    <label class="form-check-label">
                      {{configs.backupEnabled ? 'Habilitado' : 'Desabilitado'}}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <div class="card border-primary">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">backup.schedule.time</h6>
                    <span class="badge bg-primary">STRING</span>
                  </div>
                  <p class="card-text small text-muted mb-3">Horário do backup automático</p>
                  <input type="time" class="form-control form-control-sm" [(ngModel)]="configs.backupTime" value="03:00">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumo de Alterações -->
      <div *ngIf="temAlteracoesPendentes()" class="card border-warning">
        <div class="card-header bg-warning text-dark">
          <h6 class="mb-0">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Alterações Pendentes (3)
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <ul class="list-unstyled mb-0">
                <li class="mb-1"><strong>app.name</strong>: {{configs.appName}}</li>
                <li class="mb-1"><strong>security.session.timeout</strong>: {{configs.sessionTimeout}}</li>
                <li class="mb-1"><strong>backup.automatic.enabled</strong>: {{configs.backupEnabled}}</li>
              </ul>
            </div>
            <div class="col-md-4 text-end">
              <button class="btn btn-outline-secondary me-2" (click)="descartarAlteracoes()">
                <i class="bi bi-x-lg me-1"></i>Descartar
              </button>
              <button class="btn btn-warning" (click)="salvarConfiguracoes()">
                <i class="bi bi-check-lg me-1"></i>Salvar Todas
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Informações Importantes -->
      <div class="alert alert-info mt-4">
        <h6 class="alert-heading">
          <i class="bi bi-info-circle me-2"></i>Informações Importantes
        </h6>
        <ul class="mb-0">
          <li>Algumas configurações podem exigir reinicialização do sistema para ter efeito.</li>
          <li>Configurações marcadas com <i class="bi bi-lock"></i> são somente leitura.</li>
          <li>Sempre faça backup antes de alterar configurações críticas.</li>
          <li>Valores inválidos podem causar instabilidade no sistema.</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s;
    }
    
    .card:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-control-sm {
      font-size: 0.875rem;
    }
  `]
})
export class AdminConfiguracoesComponent implements OnInit {
  categoriaFiltro = '';
  buscaFiltro = '';
  carregando = false;
  erro: string | null = null;
  alteracoesPendentes = false;

  configs = {
    appName: 'IFClass',
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    backupEnabled: true,
    backupTime: '03:00'
  };

  configsOriginais = { ...this.configs };

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregarConfiguracoes();
  }

  carregarConfiguracoes(): void {
    this.carregando = true;
    this.erro = null;

    // Tentar carregar configurações do backend
    this.http.get<any>(`${environment.SERVIDOR}/api/configuracoes/settings`).subscribe({
      next: (configuracoes) => {
        // Mapear configurações do backend para o formato local
        if (configuracoes && configuracoes.length > 0) {
          configuracoes.forEach((config: any) => {
            switch (config.configKey) {
              case 'app.name':
                this.configs.appName = config.configValue;
                break;
              case 'session.timeout':
                this.configs.sessionTimeout = parseInt(config.configValue);
                break;
              case 'security.max.login.attempts':
                this.configs.maxLoginAttempts = parseInt(config.configValue);
                break;
              case 'backup.enabled':
                this.configs.backupEnabled = config.configValue === 'true';
                break;
              case 'backup.time':
                this.configs.backupTime = config.configValue;
                break;
            }
          });
        }
        this.configsOriginais = { ...this.configs };
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar configurações:', error);

        if (error.status === 0) {
          this.erro = 'Erro de conexão: Não foi possível conectar ao servidor.';
        } else if (error.status === 403) {
          this.erro = 'Acesso negado: Você não tem permissão para acessar as configurações.';
        } else if (error.status === 404) {
          this.erro = 'Configurações não encontradas: Usando valores padrão.';
        } else if (error.status === 500) {
          this.erro = 'Erro interno: Falha ao carregar configurações do servidor.';
        } else {
          this.erro = `Erro ao carregar configurações: ${error.message || 'Usando valores padrão'}`;
        }

        this.carregando = false;
      }
    });
  }

  temAlteracoesPendentes(): boolean {
    return JSON.stringify(this.configs) !== JSON.stringify(this.configsOriginais);
  }

  salvarConfiguracoes(): void {
    this.carregando = true;

    // Preparar dados para envio
    const configuracoes = [
      { configKey: 'app.name', configValue: this.configs.appName, description: 'Nome da aplicação', type: 'STRING', adminOnly: false },
      { configKey: 'session.timeout', configValue: this.configs.sessionTimeout.toString(), description: 'Timeout da sessão em segundos', type: 'NUMBER', adminOnly: true },
      { configKey: 'security.max.login.attempts', configValue: this.configs.maxLoginAttempts.toString(), description: 'Máximo de tentativas de login', type: 'NUMBER', adminOnly: true },
      { configKey: 'backup.enabled', configValue: this.configs.backupEnabled.toString(), description: 'Backup automático habilitado', type: 'BOOLEAN', adminOnly: true },
      { configKey: 'backup.time', configValue: this.configs.backupTime, description: 'Horário do backup automático', type: 'STRING', adminOnly: true }
    ];

    // Salvar cada configuração individualmente
    let configsSalvas = 0;
    const totalConfigs = configuracoes.length;

    configuracoes.forEach(config => {
      this.http.post(`${environment.SERVIDOR}/api/configuracoes/settings`, config).subscribe({
        next: (response) => {
          configsSalvas++;
          if (configsSalvas === totalConfigs) {
            this.configsOriginais = { ...this.configs };
            this.carregando = false;
            this.notificationService.showSuccess(
              'Configurações salvas com sucesso!',
              'Configurações Atualizadas'
            );
          }
        },
        error: (error) => {
          console.error('Erro ao salvar configuração:', error);
          this.carregando = false;

          let mensagem = 'Erro ao salvar configurações.';
          if (error.status === 0) {
            mensagem = 'Erro de conexão: Verifique sua conexão com o servidor.';
          } else if (error.status === 403) {
            mensagem = 'Acesso negado: Você não tem permissão para alterar configurações.';
          } else if (error.status === 500) {
            mensagem = 'Erro interno do servidor: Tente novamente em alguns minutos.';
          } else if (error.error && error.error.message) {
            mensagem = `Erro: ${error.error.message}`;
          }

          this.notificationService.showError(mensagem, 'Erro ao Salvar');
        }
      });
    });
  }

  async descartarAlteracoes(): Promise<void> {
    const confirmado = await this.notificationService.confirm(
      'Descartar Alterações',
      'Tem certeza que deseja descartar todas as alterações?',
      'Sim, descartar'
    );

    if (confirmado) {
      this.configs = { ...this.configsOriginais };
      this.notificationService.showInfo(
        'Alterações descartadas com sucesso.',
        'Alterações Descartadas'
      );
    }
  }

  async resetarTodasConfiguracoes(): Promise<void> {
    const confirmado = await this.notificationService.confirmCritical(
      'Resetar Configurações',
      'Tem certeza que deseja resetar todas as configurações para os valores padrão?\n\nEsta ação não pode ser desfeita.',
      'Sim, resetar tudo'
    );

    if (confirmado) {
      this.configs = {
        appName: 'IFClass',
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        backupEnabled: true,
        backupTime: '03:00'
      };
      this.notificationService.showWarning(
        'Configurações resetadas para valores padrão.',
        'Configurações Resetadas'
      );
    }
  }

  atualizarConfiguracoes(): void {
    this.carregarConfiguracoes();
  }

  onConfigChange(): void {
    this.alteracoesPendentes = this.temAlteracoesPendentes();
  }
}
