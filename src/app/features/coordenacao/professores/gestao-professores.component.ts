import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordenacaoService, ProfessorCarga, EstatisticasCoordenacao } from '../services/coordenacao.service';

@Component({
  selector: 'app-gestao-professores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-person-workspace me-2"></i>Gestão de Professores</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success" (click)="exportarExcel()">
            <i class="bi bi-file-excel me-1"></i>Excel
          </button>
          <button class="btn btn-outline-danger" (click)="exportarPDF()">
            <i class="bi bi-file-pdf me-1"></i>PDF
          </button>
          <button class="btn btn-primary" (click)="atualizarDados()">
            <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
          </button>
        </div>
      </div>
      
      <div class="alert alert-info" *ngIf="carregando">
        <h4><i class="bi bi-hourglass-split me-2"></i>Carregando dados...</h4>
        <p>Aguarde enquanto carregamos os dados dos professores.</p>
      </div>

      <div class="alert alert-warning" *ngIf="erro">
        <h4><i class="bi bi-exclamation-triangle me-2"></i>Aviso</h4>
        <p>{{erro}}</p>
      </div>

      <div class="alert alert-info" *ngIf="!carregando && !erro">
        <h4>👨‍🏫 Gestão de Professores</h4>
        <p>Aqui você pode gerenciar a carga horária dos professores, visualizar estatísticas e exportar relatórios.</p>
      </div>
      
      <div class="row">
        <div class="col-md-3">
          <div class="card text-center border-success">
            <div class="card-body">
              <h5 class="text-success">Carga Normal</h5>
              <h2>{{estatisticas?.professoresNormal || 0}}</h2>
              <small class="text-muted">professores</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-warning">
            <div class="card-body">
              <h5 class="text-warning">Sobrecarregados</h5>
              <h2>{{estatisticas?.professoresSobrecarregados || 0}}</h2>
              <small class="text-muted">professores</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-info">
            <div class="card-body">
              <h5 class="text-info">Subutilizados</h5>
              <h2>{{estatisticas?.professoresSubutilizados || 0}}</h2>
              <small class="text-muted">professores</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-primary">
            <div class="card-body">
              <h5 class="text-primary">Média Geral</h5>
              <h2>{{(estatisticas?.mediaHorasPorProfessor || 0) | number:'1.1-1'}}h</h2>
              <small class="text-muted">por semana</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `]
})
export class GestaoProfessoresComponent implements OnInit {
  professores: ProfessorCarga[] = [];
  estatisticas: EstatisticasCoordenacao | null = null;
  carregando = false;
  erro: string | null = null;

  constructor(private coordenacaoService: CoordenacaoService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    // Carregar estatísticas e professores
    this.coordenacaoService.getEstatisticasDashboard().subscribe({
      next: (stats) => {
        this.estatisticas = stats;
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        // Não usar dados mock, trabalhar apenas com dados reais
      }
    });

    this.coordenacaoService.getProfessoresCarga().subscribe({
      next: (professores) => {
        this.professores = professores;
        this.carregando = false;
        console.log('Professores carregados:', professores);
      },
      error: (error) => {
        console.error('Erro ao carregar professores:', error);
        this.erro = 'Erro ao carregar dados do servidor.';
        this.carregando = false;
        this.professores = []; // Não usar dados mock, apenas array vazio
      }
    });
  }



  atualizarDados(): void {
    this.carregarDados();
  }

  exportarPDF(): void {
    console.log('Exportar PDF - Implementar funcionalidade');
  }

  exportarExcel(): void {
    console.log('Exportar Excel - Implementar funcionalidade');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'NORMAL': return 'text-success';
      case 'SOBRECARREGADO': return 'text-danger';
      case 'SUBUTILIZADO': return 'text-warning';
      default: return 'text-muted';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'NORMAL': return 'Normal';
      case 'SOBRECARREGADO': return 'Sobrecarregado';
      case 'SUBUTILIZADO': return 'Subutilizado';
      default: return 'Indefinido';
    }
  }
}
