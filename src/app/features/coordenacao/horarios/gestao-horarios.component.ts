import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordenacaoService, EstatisticasCoordenacao } from '../services/coordenacao.service';
import { AulaService } from '../../aulas/aula.service';
import { Aula } from '../../aulas/aula.model';
import { CursoService } from '../../cursos/pagina/curso.service';
import { TurmaService } from '../../turmas/turma.service';
import { Curso } from '../../cursos/pagina/curso.model';
import { Turma } from '../../turmas/turma.model';

@Component({
  selector: 'app-gestao-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-calendar3 me-2"></i>Gestão de Horários</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-warning" (click)="detectarConflitos()">
            <i class="bi bi-exclamation-triangle me-1"></i>Detectar Conflitos
          </button>
          <button class="btn btn-outline-info" (click)="otimizarSalas()">
            <i class="bi bi-gear me-1"></i>Otimizar Salas
          </button>
          <button class="btn btn-primary" (click)="atualizarGrade()">
            <i class="bi bi-arrow-clockwise me-1"></i>Atualizar
          </button>
        </div>
      </div>

      <div class="alert alert-warning">
        <h4>📅 Gestão de Horários</h4>
        <p>Aqui você pode visualizar a grade horária, detectar conflitos e otimizar o uso das salas.</p>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label class="form-label">Filtrar por Curso:</label>
              <select class="form-select" [(ngModel)]="cursoSelecionado" (ngModelChange)="aplicarFiltros()">
                <option value="">Todos os Cursos</option>
                <option *ngFor="let curso of cursos" [value]="curso.id">{{curso.nome}}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Filtrar por Turma:</label>
              <select class="form-select" [(ngModel)]="turmaSelecionada" (ngModelChange)="aplicarFiltros()">
                <option value="">Todas as Turmas</option>
                <option *ngFor="let turma of turmas" [value]="turma.id">
                  {{turma.curso?.nome || 'Curso não definido'}} ({{turma.ano}}.{{turma.semestre}})
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Visualização:</label>
              <select class="form-select" [(ngModel)]="tipoVisualizacao">
                <option value="grade">Grade Horária</option>
                <option value="lista">Lista de Aulas</option>
                <option value="conflitos">Conflitos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Grade Horária Simplificada -->
      <div *ngIf="tipoVisualizacao === 'grade'" class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-grid me-2"></i>Grade Horária Semanal
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead class="table-light">
                <tr>
                  <th>Horário</th>
                  <th>Segunda</th>
                  <th>Terça</th>
                  <th>Quarta</th>
                  <th>Quinta</th>
                  <th>Sexta</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let horario of horarios">
                  <td><strong>{{horario}}</strong></td>
                  <td *ngFor="let dia of diasSemana"
                      [class]="getAulasPorHorarioEDia(horario, dia.key).length > 0 ? 'bg-primary text-white' : ''">
                    <div *ngFor="let aula of getAulasPorHorarioEDia(horario, dia.key)">
                      <strong>{{aula.disciplina.nome}}</strong><br>
                      <small>{{aula.professor.nome}} - {{aula.sala.codigo}}</small>
                    </div>
                    <div *ngIf="getAulasPorHorarioEDia(horario, dia.key).length === 0" class="text-muted">
                      <small>-</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Lista de Aulas -->
      <div *ngIf="tipoVisualizacao === 'lista'" class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-list-ul me-2"></i>Lista de Aulas
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Professor</th>
                  <th>Turma</th>
                  <th>Sala</th>
                  <th>Dia/Horário</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="carregando">
                  <td colspan="6" class="text-center py-4">
                    <i class="bi bi-hourglass-split me-2"></i>Carregando aulas...
                  </td>
                </tr>

                <tr *ngIf="aulasFiltradas.length === 0 && !carregando">
                  <td colspan="6" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox me-2"></i>Nenhuma aula encontrada
                  </td>
                </tr>

                <tr *ngFor="let aula of aulasFiltradas">
                  <td><strong>{{aula.disciplina.nome}}</strong></td>
                  <td>{{aula.professor.nome}}</td>
                  <td>{{aula.turma.curso?.nome || 'Curso não definido'}} ({{aula.turma.ano}}.{{aula.turma.semestre}})</td>
                  <td><span class="badge bg-light text-dark">{{aula.sala.codigo}}</span></td>
                  <td>
                    <strong>{{formatarDiaSemana(aula.diaSemana)}}</strong><br>
                    <small>{{aula.hora}}</small>
                  </td>
                  <td><span class="badge bg-success">Ativa</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Conflitos -->
      <div *ngIf="tipoVisualizacao === 'conflitos'" class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-exclamation-triangle me-2"></i>Análise de Conflitos
          </h5>
        </div>
        <div class="card-body">
          <!-- Sem conflitos -->
          <div *ngIf="conflitos.length === 0" class="alert alert-success">
            <i class="bi bi-check-circle text-success fs-1"></i>
            <h5 class="mt-3 text-success">Nenhum Conflito Detectado</h5>
            <p class="text-muted">Todos os horários estão organizados corretamente.</p>
          </div>

          <!-- Com conflitos -->
          <div *ngIf="conflitos.length > 0">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
              <h5 class="mt-3 text-danger">{{conflitos.length}} Conflito(s) Detectado(s)</h5>
              <p class="text-muted">Os seguintes conflitos foram encontrados na grade horária:</p>
            </div>

            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Dia/Horário</th>
                    <th>Recursos Envolvidos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let conflito of conflitos" [class]="getConflictRowClass(conflito.tipo)">
                    <td>
                      <span class="badge" [class]="getConflictBadgeClass(conflito.tipo)">
                        {{getConflictTypeText(conflito.tipo)}}
                      </span>
                    </td>
                    <td>{{conflito.descricao}}</td>
                    <td>
                      <strong>{{formatarDiaSemana(conflito.dia)}}</strong><br>
                      <small>{{conflito.horario}}</small>
                    </td>
                    <td>{{conflito.recursos}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="row mt-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-calendar-week text-primary fs-1"></i>
              <h4 class="mt-2">{{estatisticas?.totalAulas || 0}}</h4>
              <p class="text-muted mb-0">Total de Aulas</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-people text-success fs-1"></i>
              <h4 class="mt-2">{{estatisticas?.professoresAtivos || 0}}</h4>
              <p class="text-muted mb-0">Professores Ativos</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-door-open text-warning fs-1"></i>
              <h4 class="mt-2">{{estatisticas?.salasOcupadas || 0}}</h4>
              <p class="text-muted mb-0">Salas Utilizadas</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
              <h4 class="mt-2">{{conflitosDetectados}}</h4>
              <p class="text-muted mb-0">Conflitos</p>
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
    
    .table td {
      vertical-align: middle;
    }
  `]
})
export class GestaoHorariosComponent implements OnInit {
  estatisticas: EstatisticasCoordenacao | null = null;
  carregando = false;
  erro: string | null = null;
  aulas: Aula[] = [];
  aulasFiltradas: Aula[] = [];
  gradeHoraria: any = {};
  conflitos: any[] = [];

  // Dados para filtros
  cursos: Curso[] = [];
  turmas: Turma[] = [];

  cursoSelecionado = '';
  turmaSelecionada = '';
  tipoVisualizacao = 'grade';
  conflitosDetectados = 0;

  // Horários padrão
  horarios = [
    '07:00-08:40',
    '08:50-10:30',
    '10:40-12:20',
    '13:30-15:10',
    '15:20-17:00',
    '19:00-20:40',
    '20:50-22:30'
  ];

  // Dias da semana
  diasSemana = [
    { key: 'MONDAY', nome: 'Segunda' },
    { key: 'TUESDAY', nome: 'Terça' },
    { key: 'WEDNESDAY', nome: 'Quarta' },
    { key: 'THURSDAY', nome: 'Quinta' },
    { key: 'FRIDAY', nome: 'Sexta' }
  ];

  constructor(
    private coordenacaoService: CoordenacaoService,
    private aulaService: AulaService,
    private cursoService: CursoService,
    private turmaService: TurmaService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.carregarAulas();
    this.carregarCursos();
    this.carregarTurmas();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = null;

    this.coordenacaoService.getEstatisticasDashboard().subscribe({
      next: (stats) => {
        this.estatisticas = stats;
        this.carregando = false;
        console.log('Dados de horários carregados');
      },
      error: (error) => {
        console.error('Erro ao carregar dados:', error);
        this.erro = 'Erro ao carregar dados do servidor.';
        this.carregando = false;
        // Não carregar dados mock, trabalhar apenas com dados reais
      }
    });
  }

  carregarAulas(): void {
    this.aulaService.buscarTodas().subscribe({
      next: (aulas) => {
        this.aulas = aulas;
        this.aplicarFiltros();
        console.log('Aulas carregadas:', aulas.length);
      },
      error: (error) => {
        console.error('Erro ao carregar aulas:', error);
        this.aulas = []; // Sem dados mock, apenas array vazio
        this.aplicarFiltros();
      }
    });
  }

  carregarCursos(): void {
    this.cursoService.getTodosCursos().subscribe({
      next: (cursos) => {
        this.cursos = cursos;
        console.log('Cursos carregados:', cursos.length);
      },
      error: (error) => {
        console.error('Erro ao carregar cursos:', error);
        this.cursos = [];
      }
    });
  }

  carregarTurmas(): void {
    this.turmaService.listar().subscribe({
      next: (turmas) => {
        this.turmas = turmas;
        console.log('Turmas carregadas:', turmas.length);
      },
      error: (error) => {
        console.error('Erro ao carregar turmas:', error);
        this.turmas = [];
      }
    });
  }

  aplicarFiltros(): void {
    let aulasFiltradas = [...this.aulas];

    // Filtrar por curso
    if (this.cursoSelecionado) {
      aulasFiltradas = aulasFiltradas.filter(aula =>
        aula.turma.curso?.id?.toString() === this.cursoSelecionado
      );
    }

    // Filtrar por turma
    if (this.turmaSelecionada) {
      aulasFiltradas = aulasFiltradas.filter(aula =>
        aula.turma.id?.toString() === this.turmaSelecionada
      );
    }

    this.aulasFiltradas = aulasFiltradas;
    this.organizarGradeHoraria();
    this.detectarConflitosAutomatico();

    console.log(`Filtros aplicados: Curso=${this.cursoSelecionado}, Turma=${this.turmaSelecionada}`);
    console.log(`Aulas filtradas: ${this.aulasFiltradas.length} de ${this.aulas.length}`);
  }

  organizarGradeHoraria(): void {
    this.gradeHoraria = {};

    // Inicializar grade vazia
    this.horarios.forEach(horario => {
      this.gradeHoraria[horario] = {};
      this.diasSemana.forEach(dia => {
        this.gradeHoraria[horario][dia.key] = [];
      });
    });

    // Organizar aulas filtradas na grade
    const aulasParaOrganizar = this.aulasFiltradas || this.aulas;
    console.log('Organizando aulas na grade. Total de aulas filtradas:', aulasParaOrganizar.length);

    aulasParaOrganizar.forEach(aula => {
      const horarioAula = this.formatarHorario(aula.hora);
      const diaAula = aula.diaSemana;

      console.log(`Aula: ${aula.disciplina.nome}, Hora: ${aula.hora}, Horário formatado: ${horarioAula}, Dia: ${diaAula}`);

      if (this.gradeHoraria[horarioAula] && this.gradeHoraria[horarioAula][diaAula]) {
        this.gradeHoraria[horarioAula][diaAula].push(aula);
        console.log(`Aula adicionada na grade: ${horarioAula} - ${diaAula}`);
      } else {
        console.log(`Horário não encontrado na grade: ${horarioAula} para dia ${diaAula}`);
      }
    });

    console.log('Grade horária organizada:', this.gradeHoraria);
  }

  formatarHorario(hora: string): string {
    // Mapear horários das aulas para os slots fixos da grade
    const mapeamentoHorarios: { [key: string]: string } = {
      '07:00': '07:00-08:40',
      '08:50': '08:50-10:30',
      '10:40': '10:40-12:20',
      '13:30': '13:30-15:10',
      '15:20': '15:20-17:00',
      '19:00': '19:00-20:40',
      '20:50': '20:50-22:30'
    };

    // Retornar o slot correspondente ou tentar encontrar o mais próximo
    if (mapeamentoHorarios[hora]) {
      return mapeamentoHorarios[hora];
    }

    // Se não encontrar exato, tentar encontrar o slot mais próximo
    const [h, m] = hora.split(':').map(Number);
    const minutosDaAula = h * 60 + m;

    // Definir os horários de início em minutos
    const horariosMinutos = [
      { inicio: 7 * 60, slot: '07:00-08:40' },      // 420 min
      { inicio: 8 * 60 + 50, slot: '08:50-10:30' }, // 530 min
      { inicio: 10 * 60 + 40, slot: '10:40-12:20' }, // 640 min
      { inicio: 13 * 60 + 30, slot: '13:30-15:10' }, // 810 min
      { inicio: 15 * 60 + 20, slot: '15:20-17:00' }, // 920 min
      { inicio: 19 * 60, slot: '19:00-20:40' },      // 1140 min
      { inicio: 20 * 60 + 50, slot: '20:50-22:30' }  // 1250 min
    ];

    // Encontrar o slot mais próximo
    let slotMaisProximo = horariosMinutos[0];
    let menorDiferenca = Math.abs(minutosDaAula - horariosMinutos[0].inicio);

    for (const horario of horariosMinutos) {
      const diferenca = Math.abs(minutosDaAula - horario.inicio);
      if (diferenca < menorDiferenca) {
        menorDiferenca = diferenca;
        slotMaisProximo = horario;
      }
    }

    console.log(`Hora ${hora} mapeada para slot ${slotMaisProximo.slot}`);
    return slotMaisProximo.slot;
  }

  getAulasPorHorarioEDia(horario: string, dia: string): Aula[] {
    return this.gradeHoraria[horario] && this.gradeHoraria[horario][dia]
      ? this.gradeHoraria[horario][dia]
      : [];
  }





  detectarConflitos(): void {
    console.log('Detectando conflitos...');
    this.detectarConflitosAutomatico();
    alert(`Análise concluída! ${this.conflitosDetectados} conflito(s) detectado(s).`);
  }

  detectarConflitosAutomatico(): void {
    this.conflitos = [];
    const aulasParaAnalisar = this.aulasFiltradas.length > 0 ? this.aulasFiltradas : this.aulas;

    // 1. Conflitos de Professor (mesmo professor, mesmo horário, dias diferentes)
    this.detectarConflitoProfessor(aulasParaAnalisar);

    // 2. Conflitos de Sala (mesma sala, mesmo horário, mesmo dia)
    this.detectarConflitoSala(aulasParaAnalisar);

    // 3. Conflitos de Turma (mesma turma, mesmo horário, mesmo dia)
    this.detectarConflitoTurma(aulasParaAnalisar);

    this.conflitosDetectados = this.conflitos.length;
    console.log(`Conflitos detectados: ${this.conflitosDetectados}`, this.conflitos);
  }

  detectarConflitoProfessor(aulas: Aula[]): void {
    const professorHorarios: { [key: string]: Aula[] } = {};

    aulas.forEach(aula => {
      const chave = `${aula.professor.id}_${aula.diaSemana}_${aula.hora}`;
      if (!professorHorarios[chave]) {
        professorHorarios[chave] = [];
      }
      professorHorarios[chave].push(aula);
    });

    Object.values(professorHorarios).forEach(aulasConflito => {
      if (aulasConflito.length > 1) {
        const professor = aulasConflito[0].professor.nome;
        const salas = aulasConflito.map(a => a.sala.codigo).join(', ');
        const disciplinas = aulasConflito.map(a => a.disciplina.nome).join(', ');

        this.conflitos.push({
          tipo: 'PROFESSOR',
          descricao: `Professor ${professor} tem ${aulasConflito.length} aulas simultâneas`,
          dia: aulasConflito[0].diaSemana,
          horario: aulasConflito[0].hora,
          recursos: `Salas: ${salas} | Disciplinas: ${disciplinas}`
        });
      }
    });
  }

  detectarConflitoSala(aulas: Aula[]): void {
    const salaHorarios: { [key: string]: Aula[] } = {};

    aulas.forEach(aula => {
      const chave = `${aula.sala.id}_${aula.diaSemana}_${aula.hora}`;
      if (!salaHorarios[chave]) {
        salaHorarios[chave] = [];
      }
      salaHorarios[chave].push(aula);
    });

    Object.values(salaHorarios).forEach(aulasConflito => {
      if (aulasConflito.length > 1) {
        const sala = aulasConflito[0].sala.codigo;
        const professores = aulasConflito.map(a => a.professor.nome).join(', ');
        const turmas = aulasConflito.map(a => `${a.turma.curso?.nome}(${a.turma.ano}.${a.turma.semestre})`).join(', ');

        this.conflitos.push({
          tipo: 'SALA',
          descricao: `Sala ${sala} ocupada por ${aulasConflito.length} aulas simultâneas`,
          dia: aulasConflito[0].diaSemana,
          horario: aulasConflito[0].hora,
          recursos: `Professores: ${professores} | Turmas: ${turmas}`
        });
      }
    });
  }

  detectarConflitoTurma(aulas: Aula[]): void {
    const turmaHorarios: { [key: string]: Aula[] } = {};

    aulas.forEach(aula => {
      const chave = `${aula.turma.id}_${aula.diaSemana}_${aula.hora}`;
      if (!turmaHorarios[chave]) {
        turmaHorarios[chave] = [];
      }
      turmaHorarios[chave].push(aula);
    });

    Object.values(turmaHorarios).forEach(aulasConflito => {
      if (aulasConflito.length > 1) {
        const turma = `${aulasConflito[0].turma.curso?.nome}(${aulasConflito[0].turma.ano}.${aulasConflito[0].turma.semestre})`;
        const professores = aulasConflito.map(a => a.professor.nome).join(', ');
        const disciplinas = aulasConflito.map(a => a.disciplina.nome).join(', ');

        this.conflitos.push({
          tipo: 'TURMA',
          descricao: `Turma ${turma} tem ${aulasConflito.length} aulas simultâneas`,
          dia: aulasConflito[0].diaSemana,
          horario: aulasConflito[0].hora,
          recursos: `Professores: ${professores} | Disciplinas: ${disciplinas}`
        });
      }
    });
  }

  getConflictRowClass(tipo: string): string {
    switch (tipo) {
      case 'PROFESSOR': return 'table-warning';
      case 'SALA': return 'table-danger';
      case 'TURMA': return 'table-info';
      default: return '';
    }
  }

  getConflictBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'PROFESSOR': return 'bg-warning text-dark';
      case 'SALA': return 'bg-danger';
      case 'TURMA': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getConflictTypeText(tipo: string): string {
    switch (tipo) {
      case 'PROFESSOR': return 'Professor';
      case 'SALA': return 'Sala';
      case 'TURMA': return 'Turma';
      default: return 'Desconhecido';
    }
  }

  otimizarSalas(): void {
    console.log('Otimizando salas...');
    alert('Otimização de salas iniciada! (simulado)');
  }

  atualizarGrade(): void {
    console.log('Atualizando grade...');
    this.carregarDados();
    this.carregarAulas();
    this.carregarCursos();
    this.carregarTurmas();
    alert('Grade atualizada com sucesso!');
  }

  formatarDiaSemana(dia: string): string {
    const dias: { [key: string]: string } = {
      'MONDAY': 'Segunda',
      'TUESDAY': 'Terça',
      'WEDNESDAY': 'Quarta',
      'THURSDAY': 'Quinta',
      'FRIDAY': 'Sexta',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dias[dia] || dia;
  }
}
