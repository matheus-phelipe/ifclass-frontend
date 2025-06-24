import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;
import { AulaService } from '../aula.service';
import { Sala } from '../../aluno/sala.model';
import { Turma } from '../../turmas/turma.model';
import { Disciplina } from '../../disciplinas/disciplina.model';
import { Usuario } from '../../usuario/usuario.model';
import { TurmaService } from '../../turmas/turma.service';
import { DisciplinaService } from '../../disciplinas/disciplina.service';
import { UsuarioService } from '../../usuario/usuario.service';
import { BlocoService } from '../../aluno/bloco.service';
import { Bloco } from '../../aluno/bloco.model';
import { AuthService } from '../../../service/auth/auth.service';
import { Aula } from '../aula.model';
import { ProfileSwitcherComponent } from '../../../shared/profile-switcher/profile-switcher';
import { ModalConfirmacaoComponent } from '../../../shared/modal-confirmacao/modal-confirmacao';

@Component({
  selector: 'app-criar-aula',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ProfileSwitcherComponent, ModalConfirmacaoComponent],
  templateUrl: './criar-aula.html',
  styleUrls: ['./criar-aula.css']
})
export class CriarAulaComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  salas: Sala[] = [];
  turmas: Turma[] = [];
  disciplinas: Disciplina[] = [];
  professores: Usuario[] = [];
  carregando = false;
  sucesso = '';
  erro = '';
  blocos: Bloco[] = [];
  aulas: Aula[] = [];
  perfil: string | null = null;
  usuarioId: number | null = null;
  aulaParaRemover: Aula | null = null;
  isModalVisible = false;
  modalConfig = { title: '', message: '', type: 'primary' as 'primary' | 'danger' | 'success' };

  // Melhorias na tela
  conflitos: string[] = [];
  salasDisponiveis: Sala[] = [];
  salasRecomendadas: Sala[] = [];
  agendaProfessor: Aula[] = [];
  isValidatingConflicts = false;
  showSuggestions = false;

  // Paginação
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  paginatedAulas: Aula[] = [];

  @ViewChild('modalConfirm') modalConfirm!: ModalConfirmacaoComponent;

  constructor(
    private fb: FormBuilder,
    private aulaService: AulaService,
    private turmaService: TurmaService,
    private disciplinaService: DisciplinaService,
    private usuarioService: UsuarioService,
    private blocoService: BlocoService,
    private authService: AuthService,
    private elementRef: ElementRef
  ) {
    this.form = this.fb.group({
      sala: [null, Validators.required],
      turma: [null, Validators.required],
      disciplina: [null, Validators.required],
      professor: [null, Validators.required],
      diaSemana: [null, Validators.required],
      hora: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.blocoService.getBlocos().subscribe({
      next: blocos => {
        this.blocos = blocos;
        this.salas = blocos.flatMap(b => b.salas);
      }
    });
    this.turmaService.listar().subscribe({ next: t => this.turmas = t });
    this.disciplinaService.listar().subscribe({ next: d => this.disciplinas = d });
    this.usuarioService.listarTodos().subscribe({ next: u => this.professores = u.filter(p => p.authorities.includes('ROLE_PROFESSOR')) });
    this.usuarioId = this.authService.getIdUsuario();
    this.perfil = this.authService.getActiveRole();
    this.carregarAulas();
    this.setupFormValidation();
  }

  ngAfterViewInit(): void {
    // Inicializar tooltips do Bootstrap
    this.initializeTooltips();
  }

  initializeTooltips(): void {
    setTimeout(() => {
      const tooltipTriggerList = this.elementRef.nativeElement.querySelectorAll('[data-bs-toggle="tooltip"]');
      if (typeof bootstrap !== 'undefined') {
        tooltipTriggerList.forEach((tooltipTriggerEl: any) => {
          new bootstrap.Tooltip(tooltipTriggerEl);
        });
      }
    }, 100);
  }

  criarAula() {
    this.sucesso = '';
    this.erro = '';
    if (this.form.invalid) return;

    // Verificar conflitos antes de criar
    if (this.conflitos.length > 0) {
      this.erro = 'Não é possível criar a aula devido a conflitos: ' + this.conflitos.join(', ');
      return;
    }

    this.carregando = true;
    const sala = this.salas.find(s => s.id === Number(this.form.value.sala));
    const turma = this.turmas.find(t => t.id === Number(this.form.value.turma));
    const disciplina = this.disciplinas.find(d => d.id === Number(this.form.value.disciplina));
    const professor = this.professores.find(p => p.id === Number(this.form.value.professor));
    if (!sala || !turma || !disciplina || !professor) {
      this.erro = 'Selecione todos os campos corretamente.';
      this.carregando = false;
      return;
    }
    const aula: Aula = {
      sala,
      turma,
      disciplina,
      professor,
      diaSemana: this.form.value.diaSemana,
      hora: this.form.value.hora
    };
    this.aulaService.criarAula(aula).subscribe({
      next: () => {
        this.sucesso = 'Aula criada com sucesso!';
        this.form.reset();
        this.carregarAulas();
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao criar aula.';
        this.carregando = false;
      }
    });
  }

  abrirModalRemocao(aula: Aula) {
    this.aulaParaRemover = aula;
    const disciplina = aula.disciplina.nome;
    const dia = this.formatarDiaSemana(aula.diaSemana);
    this.modalConfig = {
      title: 'Confirmar Remoção',
      message: `Tem certeza que deseja remover a aula de ${disciplina} de toda ${dia}?`,
      type: 'danger'
    };
    this.isModalVisible = true;
  }

  confirmarRemocao() {
    if (!this.aulaParaRemover || !this.aulaParaRemover.id) return;
    
    this.aulaService.remover(this.aulaParaRemover.id).subscribe({
      next: () => {
        this.sucesso = 'Aula removida com sucesso!';
        this.aulas = this.aulas.filter(a => a.id !== this.aulaParaRemover!.id);
        this.cancelarRemocao();
        this.carregarAulas();
      },
      error: () => {
        this.erro = 'Erro ao remover a aula.';
        this.cancelarRemocao();
      }
    });
  }

  cancelarRemocao() {
    this.isModalVisible = false;
    this.aulaParaRemover = null;
  }

  formatarDiaSemana(dia: string | undefined): string {
    if (!dia) return '';
    const dias: { [key: string]: string } = {
      'MONDAY': 'Segunda-feira',
      'TUESDAY': 'Terça-feira',
      'WEDNESDAY': 'Quarta-feira',
      'THURSDAY': 'Quinta-feira',
      'FRIDAY': 'Sexta-feira',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dias[dia] || dia;
  }

  getBlocoNome(salaId: number): string {
    const bloco = this.blocos.find(b => b.salas.some(s => s.id === salaId));
    return bloco ? bloco.nome : '-';
  }

  carregarAulas() {
    if (this.perfil === 'ROLE_PROFESSOR' && this.usuarioId) {
      this.aulaService.buscarPorProfessor(this.usuarioId).subscribe({
        next: aulas => {
          this.aulas = this.ordenarAulas(aulas);
          this.updatePagination();
        }
      });
    } else {
      this.aulaService.buscarTodas().subscribe({
        next: aulas => {
          this.aulas = this.ordenarAulas(aulas);
          this.updatePagination();
        }
      });
    }
  }

  private ordenarAulas(aulas: Aula[]): Aula[] {
    const ordemDias = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    return aulas.sort((a, b) => {
      const diaA = ordemDias.indexOf(a.diaSemana);
      const diaB = ordemDias.indexOf(b.diaSemana);
      if (diaA !== diaB) {
        return diaA - diaB;
      }
      return a.hora.localeCompare(b.hora);
    });
  }

  setupFormValidation() {
    // Observar mudanças nos campos para validar conflitos
    this.form.valueChanges.subscribe(() => {
      this.validarConflitos();
      this.sugerirSalas();
    });
  }

  validarConflitos() {
    this.conflitos = [];
    this.isValidatingConflicts = true;

    const formValue = this.form.value;
    if (!formValue.diaSemana || !formValue.hora || !formValue.professor || !formValue.sala) {
      this.isValidatingConflicts = false;
      return;
    }

    // Verificar conflito de professor
    const conflitoProfessor = this.aulas.find(aula =>
      aula.professor.id === formValue.professor &&
      aula.diaSemana === formValue.diaSemana &&
      aula.hora === formValue.hora
    );

    if (conflitoProfessor) {
      this.conflitos.push(`Professor já tem aula de ${conflitoProfessor.disciplina.nome} neste horário`);
    }

    // Verificar conflito de sala
    const conflitoSala = this.aulas.find(aula =>
      aula.sala.id === formValue.sala &&
      aula.diaSemana === formValue.diaSemana &&
      aula.hora === formValue.hora
    );

    if (conflitoSala) {
      this.conflitos.push(`Sala já está ocupada com aula de ${conflitoSala.disciplina.nome}`);
    }

    // Verificar conflito de turma
    const conflitoTurma = this.aulas.find(aula =>
      aula.turma.id === formValue.turma &&
      aula.diaSemana === formValue.diaSemana &&
      aula.hora === formValue.hora
    );

    if (conflitoTurma) {
      this.conflitos.push(`Turma já tem aula de ${conflitoTurma.disciplina.nome} neste horário`);
    }

    this.isValidatingConflicts = false;
  }

  sugerirSalas() {
    const formValue = this.form.value;
    if (!formValue.diaSemana || !formValue.hora) {
      this.salasDisponiveis = [];
      this.salasRecomendadas = [];
      this.showSuggestions = false;
      return;
    }

    // Salas disponíveis (não ocupadas no horário)
    this.salasDisponiveis = this.salas.filter(sala => {
      return !this.aulas.some(aula =>
        aula.sala.id === sala.id &&
        aula.diaSemana === formValue.diaSemana &&
        aula.hora === formValue.hora
      );
    });

    // Salas recomendadas (baseado na capacidade e disponibilidade)
    this.salasRecomendadas = this.salasDisponiveis
      .sort((a, b) => (a.capacidade || 0) - (b.capacidade || 0))
      .slice(0, 3);

    this.showSuggestions = this.salasDisponiveis.length > 0;
  }

  carregarAgendaProfessor(professorId: number) {
    if (!professorId) {
      this.agendaProfessor = [];
      return;
    }

    this.agendaProfessor = this.aulas.filter(aula => aula.professor.id === professorId);
  }

  selecionarSalaRecomendada(sala: Sala) {
    this.form.patchValue({ sala: sala.id });
    this.showSuggestions = false;
  }

  onProfessorChange() {
    const professorId = this.form.value.professor;
    if (professorId) {
      this.carregarAgendaProfessor(professorId);
    }
  }

  // Métodos de Paginação
  updatePagination() {
    this.totalPages = Math.ceil(this.aulas.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePaginatedAulas();
  }

  updatePaginatedAulas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAulas = this.aulas.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedAulas();
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  getEndIndex(): number {
    const endIndex = this.currentPage * this.itemsPerPage;
    return Math.min(endIndex, this.aulas.length);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
