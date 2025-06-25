import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordenacaoService, ProfessorCarga, EstatisticasCoordenacao } from '../services/coordenacao.service';
import { RelatorioService, RelatorioRequest } from '../services/relatorio.service';

@Component({
  selector: 'app-relatorios-coordenacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-file-earmark-bar-graph me-2"></i>Relatórios de Coordenação</h2>
      </div>

      <div class="alert alert-primary">
        <h4>📊 Relatórios de Coordenação</h4>
        <p>Aqui você pode gerar e visualizar relatórios detalhados sobre ocupação de salas, carga horária dos professores e desempenho das turmas.</p>
      </div>

      <!-- Seletor de Relatórios -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <label class="form-label">Tipo de Relatório:</label>
                  <select class="form-select" [(ngModel)]="tipoRelatorio">
                    <option value="">Selecione um relatório</option>
                    <option value="ocupacao-salas">Ocupação de Salas</option>
                    <option value="carga-horaria">Carga Horária dos Professores</option>
                    <option value="desempenho-turmas">Desempenho por Turma</option>
                    <option value="grade-horaria">Grade Horária Geral</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Data Início:</label>
                  <input type="date" class="form-control" [(ngModel)]="dataInicio">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Data Fim:</label>
                  <input type="date" class="form-control" [(ngModel)]="dataFim">
                </div>
                <div class="col-md-2">
                  <label class="form-label">&nbsp;</label>
                  <button class="btn btn-primary d-block w-100" (click)="gerarRelatorio()">
                    <i class="bi bi-search me-1"></i>Gerar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Exemplo de Relatório -->
      <div *ngIf="tipoRelatorio" class="card mb-4">
        <div class="card-header d-flex justify-content-between">
          <h5 class="mb-0">
            <i class="bi bi-door-open me-2"></i>{{getTituloRelatorio()}}
          </h5>
          <div class="btn-group">
            <button class="btn btn-outline-success btn-sm" (click)="exportarExcel()">
              <i class="bi bi-file-excel me-1"></i>Excel
            </button>
            <button class="btn btn-outline-danger btn-sm" (click)="exportarPDF()">
              <i class="bi bi-file-pdf me-1"></i>PDF
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="alert alert-success">
            <h6>✅ Relatório Gerado com Sucesso!</h6>
            <p>Os dados do relatório "{{getTituloRelatorio()}}" foram processados para o período selecionado.</p>
          </div>
          
          <!-- Dados de Exemplo -->
          <div class="row">
            <div class="col-md-4">
              <div class="card bg-light">
                <div class="card-body text-center">
                  <h5>Dados Processados</h5>
                  <h2 class="text-primary">{{getDadosProcessados()}}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-light">
                <div class="card-body text-center">
                  <h5>Período</h5>
                  <p class="mb-0">{{dataInicio}} a {{dataFim}}</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-light">
                <div class="card-body text-center">
                  <h5>Status</h5>
                  <span class="badge bg-success fs-6">Concluído</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vazio -->
      <div *ngIf="!tipoRelatorio" class="card">
        <div class="card-body text-center py-5">
          <i class="bi bi-file-earmark-bar-graph fs-1 text-muted"></i>
          <h5 class="mt-3 text-muted">Selecione um Tipo de Relatório</h5>
          <p class="text-muted">Escolha o tipo de relatório que deseja gerar no menu acima.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `]
})
export class RelatoriosCoordenacaoComponent implements OnInit {
  estatisticas: EstatisticasCoordenacao | null = null;
  professores: ProfessorCarga[] = [];
  carregando = false;
  erro: string | null = null;

  tipoRelatorio = '';
  dataInicio = '';
  dataFim = '';

  constructor(
    private coordenacaoService: CoordenacaoService,
    private relatorioService: RelatorioService
  ) {
    // Definir datas padrão (último mês)
    const hoje = new Date();
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());

    this.dataInicio = mesPassado.toISOString().split('T')[0];
    this.dataFim = hoje.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    // Carregar estatísticas
    this.coordenacaoService.getEstatisticasDashboard().subscribe({
      next: (stats) => {
        this.estatisticas = stats;
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        // Não usar dados mock, trabalhar apenas com dados reais
      }
    });

    // Carregar dados dos professores
    this.coordenacaoService.getProfessoresCarga().subscribe({
      next: (professores) => {
        this.professores = professores;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar professores:', error);
        this.erro = 'Erro ao carregar dados do servidor.';
        this.carregando = false;
        this.professores = []; // Não usar dados mock, apenas array vazio
      }
    });
  }

  gerarRelatorio(): void {
    if (!this.tipoRelatorio) {
      alert('Por favor, selecione um tipo de relatório.');
      return;
    }

    const request: RelatorioRequest = {
      tipo: this.tipoRelatorio,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      formato: 'html'
    };

    this.carregando = true;
    this.relatorioService.gerarRelatorio(request).subscribe({
      next: (resultado) => {
        this.carregando = false;
        alert(`✅ ${resultado}`);
      },
      error: (error) => {
        this.carregando = false;
        console.error('Erro ao gerar relatório:', error);
        alert('❌ Erro ao gerar relatório. Tente novamente.');
      }
    });
  }

  getTituloRelatorio(): string {
    switch (this.tipoRelatorio) {
      case 'ocupacao-salas': return 'Relatório de Ocupação de Salas';
      case 'carga-horaria': return 'Relatório de Carga Horária dos Professores';
      case 'desempenho-turmas': return 'Relatório de Desempenho por Turma';
      case 'grade-horaria': return 'Relatório de Grade Horária Geral';
      default: return 'Relatório';
    }
  }

  getDadosProcessados(): string {
    if (!this.estatisticas) return '0';

    switch (this.tipoRelatorio) {
      case 'ocupacao-salas': return `${this.estatisticas.totalSalas} salas`;
      case 'carga-horaria': return `${this.estatisticas.totalProfessores} professores`;
      case 'desempenho-turmas': return `${this.estatisticas.totalTurmas} turmas`;
      case 'grade-horaria': return `${this.estatisticas.totalAulas} aulas`;
      default: return '0';
    }
  }

  exportarPDF(): void {
    if (!this.tipoRelatorio) {
      alert('Por favor, selecione um tipo de relatório.');
      return;
    }

    const request: RelatorioRequest = {
      tipo: this.tipoRelatorio,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      formato: 'pdf'
    };

    this.relatorioService.downloadPDF(request);
  }

  exportarExcel(): void {
    if (!this.tipoRelatorio) {
      alert('Por favor, selecione um tipo de relatório.');
      return;
    }

    const request: RelatorioRequest = {
      tipo: this.tipoRelatorio,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      formato: 'excel'
    };

    this.relatorioService.downloadExcel(request);
  }
}
