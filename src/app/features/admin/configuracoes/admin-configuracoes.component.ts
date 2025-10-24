import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../shared/sweetalert/notification.service';

interface ConfiguracaoSistema {
  chave: string;
  valor: string;
  tipo: string;
  descricao: string;
  categoria: string;
  editavel: boolean;
  ultimaAtualizacao?: string;
  valorPadrao?: string;
}

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

      <!-- Indicador de Carregamento -->
      <div *ngIf="carregando" class="alert alert-info">
        <h4><i class="bi bi-hourglass-split me-2"></i>Carregando configurações...</h4>
        <p>Aguarde enquanto carregamos as configurações do sistema.</p>
      </div>

      <!-- Erro -->
      <div *ngIf="erro" class="alert alert-danger">
        <h4><i class="bi bi-exclamation-triangle me-2"></i>Erro ao Carregar</h4>
        <p>{{erro}}</p>
        <button class="btn btn-outline-danger" (click)="carregarConfiguracoes()">
          <i class="bi bi-arrow-clockwise me-1"></i>Tentar Novamente
        </button>
      </div>

      <!-- Configurações Dinâmicas -->
      <div *ngIf="!carregando && !erro && configuracoes.length > 0">
        <div *ngFor="let categoria of getCategorias()" class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-gear-fill me-2"></i>{{categoria}}
              <span class="badge bg-secondary ms-2">{{getConfiguracoesPorCategoria(categoria).length}}</span>
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div *ngFor="let config of getConfiguracoesPorCategoria(categoria)" class="col-md-6 mb-3">
                <div class="card" [ngClass]="getCardClass(config.tipo)">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h6 class="card-title mb-0">{{config.chave}}</h6>
                      <div class="d-flex gap-1">
                        <span class="badge" [ngClass]="getBadgeClass(config.tipo)">{{config.tipo}}</span>
                        <span *ngIf="!config.editavel" class="badge bg-secondary" title="Somente leitura">
                          <i class="bi bi-lock"></i>
                        </span>
                      </div>
                    </div>
                    <p class="card-text small text-muted mb-3">{{config.descricao}}</p>
                    
                    <!-- Input baseado no tipo -->
                    <input *ngIf="config.tipo === 'STRING'" 
                           type="text" 
                           class="form-control form-control-sm" 
                           [value]="config.valor"
                           [disabled]="!config.editavel"
                           (input)="onConfigChangeValue(config.chave, $event)">
                    
                    <input *ngIf="config.tipo === 'NUMBER'" 
                           type="number" 
                           class="form-control form-control-sm" 
                           [value]="config.valor"
                           [disabled]="!config.editavel"
                           (input)="onConfigChangeValue(config.chave, $event)">
                    
                    <div *ngIf="config.tipo === 'BOOLEAN'" class="form-check form-switch">
                      <input class="form-check-input" 
                             type="checkbox" 
                             [checked]="config.valor === 'true'"
                             [disabled]="!config.editavel"
                             (change)="onConfigChangeValue(config.chave, $event)">
                      <label class="form-check-label">
                        {{config.valor === 'true' ? 'Habilitado' : 'Desabilitado'}}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensagem quando não há configurações -->
      <div *ngIf="!carregando && !erro && configuracoes.length === 0" class="alert alert-warning">
        <h4><i class="bi bi-exclamation-triangle me-2"></i>Nenhuma Configuração Encontrada</h4>
        <p>Não foram encontradas configurações do sistema. Verifique se o backend está funcionando corretamente.</p>
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
  configuracoes: ConfiguracaoSistema[] = [];

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

    // Carregar configurações do backend
    this.http.get<ConfiguracaoSistema[]>(`${environment.SERVIDOR}/api/admin/configuracoes`).subscribe({
      next: (configuracoes) => {
        this.configuracoes = configuracoes;
        this.carregando = false;
        this.notificationService.showInfo(
          'Configurações carregadas',
          `${configuracoes.length} configurações carregadas com sucesso`
        );
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
    // Com o novo sistema dinâmico, não precisamos mais verificar alterações pendentes
    // pois as mudanças são salvas automaticamente
    return false;
  }

  salvarConfiguracoes(): void {
    // Com o novo sistema dinâmico, as configurações são salvas automaticamente
    // quando o usuário faz alterações. Este método agora apenas mostra uma mensagem.
    this.notificationService.success(
      'Configurações Salvas',
      'Todas as configurações foram salvas automaticamente!'
    );
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

  // Métodos para template dinâmico
  getCategorias(): string[] {
    const categorias = [...new Set(this.configuracoes.map((c: ConfiguracaoSistema) => c.categoria))];
    return categorias.sort();
  }

  getConfiguracoesPorCategoria(categoria: string): ConfiguracaoSistema[] {
    return this.configuracoes.filter((c: ConfiguracaoSistema) => c.categoria === categoria);
  }

  getCardClass(tipo: string): string {
    switch (tipo) {
      case 'STRING': return 'border-primary';
      case 'NUMBER': return 'border-success';
      case 'BOOLEAN': return 'border-warning';
      default: return 'border-secondary';
    }
  }

  getBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'STRING': return 'bg-primary';
      case 'NUMBER': return 'bg-success';
      case 'BOOLEAN': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  onConfigChangeValue(chave: string, event: any): void {
    let novoValor: string;
    
    if (event.target.type === 'checkbox') {
      novoValor = event.target.checked.toString();
    } else {
      novoValor = event.target.value;
    }

    // Atualizar configuração no backend
    this.atualizarConfiguracao(chave, novoValor);
  }

  atualizarConfiguracao(chave: string, valor: string): void {
    this.http.put(`${environment.SERVIDOR}/api/admin/configuracoes/${chave}`, { valor })
      .subscribe({
        next: (response: any) => {
          if (response.sucesso) {
            // Atualizar configuração local
            const config = this.configuracoes.find((c: ConfiguracaoSistema) => c.chave === chave);
            if (config) {
              config.valor = valor;
            }
            this.notificationService.success('Configuração Atualizada', response.mensagem);
          } else {
            this.notificationService.error('Erro ao Atualizar', response.mensagem);
          }
        },
        error: (error) => {
          this.notificationService.error('Erro ao Atualizar', 'Erro ao atualizar configuração');
        }
      });
  }

  async salvarConfiguracoesNovo(): Promise<void> {
    this.notificationService.success('Configurações Salvas', 'Todas as configurações foram salvas com sucesso!');
  }

  async resetarTodasConfiguracoesNovo(): Promise<void> {
    const confirmado = await this.notificationService.confirmCritical(
      'Resetar Configurações',
      'Tem certeza que deseja resetar todas as configurações para os valores padrão?',
      'Sim, resetar tudo'
    );

    if (confirmado) {
      this.http.post(`${environment.SERVIDOR}/api/admin/configuracoes/reset`, {})
        .subscribe({
          next: (response: any) => {
            if (response.sucesso) {
              this.notificationService.success('Configurações Resetadas', response.mensagem);
              this.carregarConfiguracoes();
            } else {
              this.notificationService.error('Erro ao Resetar', response.mensagem);
            }
          },
          error: (error) => {
            this.notificationService.error('Erro ao Resetar', 'Erro ao resetar configurações');
          }
        });
    }
  }
}
