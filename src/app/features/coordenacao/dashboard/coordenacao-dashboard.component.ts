import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoordenacaoService, EstatisticasCoordenacao } from '../services/coordenacao.service';



@Component({
  selector: 'app-coordenacao-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-graph-up me-2"></i>Dashboard de Coordenação</h2>
        <button class="btn btn-outline-primary" (click)="atualizarDados()">
          <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
        </button>
      </div>

      <div class="alert alert-info" *ngIf="carregando">
        <h4><i class="bi bi-hourglass-split me-2"></i>Carregando dados...</h4>
        <p>Aguarde enquanto carregamos as estatísticas mais recentes.</p>
      </div>

      <div class="alert alert-warning" *ngIf="erro">
        <h4><i class="bi bi-exclamation-triangle me-2"></i>Aviso</h4>
        <p>{{erro}}</p>
      </div>

      <!-- Estatísticas Detalhadas -->
      <div class="row mb-4" *ngIf="estatisticas && !carregando">
        <div class="col-md-6 mb-3">
          <div class="card border-success">
            <div class="card-header bg-success text-white">
              <h6 class="mb-0"><i class="bi bi-people me-2"></i>Carga Horária dos Professores</h6>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-4">
                  <h4 class="text-success">{{estatisticas.professoresNormal || 0}}</h4>
                  <small class="text-muted">Normal</small>
                </div>
                <div class="col-4">
                  <h4 class="text-warning">{{estatisticas.professoresSobrecarregados || 0}}</h4>
                  <small class="text-muted">Sobrecarregados</small>
                </div>
                <div class="col-4">
                  <h4 class="text-info">{{estatisticas.professoresSubutilizados || 0}}</h4>
                  <small class="text-muted">Subutilizados</small>
                </div>
              </div>
              <hr>
              <div class="text-center">
                <h5 class="text-primary">{{(estatisticas.mediaHorasPorProfessor || 0) | number:'1.1-1'}}h</h5>
                <small class="text-muted">Média de horas por professor</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <div class="card border-info">
            <div class="card-header bg-info text-white">
              <h6 class="mb-0"><i class="bi bi-building me-2"></i>Ocupação de Salas</h6>
            </div>
            <div class="card-body">
              <div class="row text-center mb-3">
                <div class="col-6">
                  <h4 class="text-primary">{{estatisticas.salasOcupadas || 0}}</h4>
                  <small class="text-muted">Salas Ocupadas</small>
                </div>
                <div class="col-6">
                  <h4 class="text-secondary">{{estatisticas.totalSalas || 0}}</h4>
                  <small class="text-muted">Total de Salas</small>
                </div>
              </div>
              <div class="progress mb-2" style="height: 10px;">
                <div class="progress-bar bg-info"
                     [style.width.%]="estatisticas.percentualOcupacaoSalas || 0"
                     [attr.aria-valuenow]="estatisticas.percentualOcupacaoSalas || 0"
                     aria-valuemin="0"
                     aria-valuemax="100">
                </div>
              </div>
              <div class="text-center">
                <small class="text-muted">{{(estatisticas.percentualOcupacaoSalas || 0) | number:'1.1-1'}}% de ocupação</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-success" *ngIf="estatisticas && !carregando && !erro">
        <h4>✅ Dados Atualizados!</h4>
        <p>Dashboard conectado com sucesso ao backend. Dados em tempo real carregados.</p>
      </div>

      <!-- Cards de Estatísticas Simplificados -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card border-primary">
            <div class="card-body text-center">
              <i class="bi bi-people-fill text-primary fs-1"></i>
              <h3 class="mt-2">{{estatisticas?.totalProfessores || 0}}</h3>
              <p class="text-muted mb-0">Professores</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-success">
            <div class="card-body text-center">
              <i class="bi bi-calendar-check-fill text-success fs-1"></i>
              <h3 class="mt-2">{{estatisticas?.aulasHoje || 0}}</h3>
              <p class="text-muted mb-0">Aulas Hoje</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-warning">
            <div class="card-body text-center">
              <i class="bi bi-collection-fill text-warning fs-1"></i>
              <h3 class="mt-2">{{estatisticas?.totalTurmas || 0}}</h3>
              <p class="text-muted mb-0">Turmas</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-info">
            <div class="card-body text-center">
              <i class="bi bi-journal-bookmark-fill text-info fs-1"></i>
              <h3 class="mt-2">{{estatisticas?.totalDisciplinas || 0}}</h3>
              <p class="text-muted mb-0">Disciplinas</p>
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
                  <button class="btn btn-outline-primary w-100" routerLink="/app/coordenacao/relatorios">
                    <i class="bi bi-file-earmark-bar-graph me-2"></i>Gerar Relatório
                  </button>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-success w-100" routerLink="/app/coordenacao/professores">
                    <i class="bi bi-person-workspace me-2"></i>Gestão Professores
                  </button>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-warning w-100" routerLink="/app/coordenacao/horarios">
                    <i class="bi bi-calendar3 me-2"></i>Grade Horária
                  </button>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-info w-100" routerLink="/app/criar-aula">
                    <i class="bi bi-plus-square me-2"></i>Nova Aula
                  </button>
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
    
    .alert-warning {
      border-left-color: #ffc107;
    }
    
    .alert-danger {
      border-left-color: #dc3545;
    }
    
    .alert-info {
      border-left-color: #0dcaf0;
    }
    
    .alert-success {
      border-left-color: #198754;
    }
  `]
})
export class CoordenacaoDashboardComponent implements OnInit {
  estatisticas: EstatisticasCoordenacao | null = null;
  carregando = false;
  erro: string | null = null;

  constructor(private coordenacaoService: CoordenacaoService) {}

  ngOnInit(): void {
    this.carregarEstatisticas();
  }

  carregarEstatisticas(): void {
    this.carregando = true;
    this.erro = null;

    this.coordenacaoService.getEstatisticasDashboard().subscribe({
      next: (dados) => {
        this.estatisticas = dados;
        this.carregando = false;
        console.log('Estatísticas carregadas:', dados);
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.erro = 'Erro ao carregar dados do servidor.';
        this.carregando = false;
        // Não usar dados mock, trabalhar apenas com dados reais
      }
    });
  }



  atualizarDados(): void {
    this.carregarEstatisticas();
  }
}
