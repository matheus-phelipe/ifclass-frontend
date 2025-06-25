import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Curso } from './curso.model';
import { CursoService } from './curso.service';
import { AuthService } from '../../../service/auth/auth.service';
import { ProfileSwitcherComponent } from '../../../shared/profile-switcher/profile-switcher';
import { DashboardStatsComponent, StatCard } from '../../../shared/dashboard-stats/dashboard-stats.component';
import { ExportButtonsComponent } from '../../../shared/export-buttons/export-buttons.component';
import { FavoriteButtonComponent } from '../../../shared/favorite-button/favorite-button.component';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ProfileSwitcherComponent, FilterPipe, DashboardStatsComponent],
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css']
})
export class CursosComponent implements OnInit, AfterViewInit {
  cursos: Curso[] = [];
  cursoForm: FormGroup;
  isLoading = true;
  isModalOpen = false;
  isEditing = false;

  termoBusca = '';
  cursoDetalhes: Curso | null = null;
  cursoParaDeletar: Curso | null = null;

  departamentosDisponiveis: string[] = ['Computação', 'Matemática', 'Física', 'Química', 'Engenharia', 'Outros'];

  // Estatísticas
  statsCards: StatCard[] = [];
  isLoadingStats = true;

  // Funcionalidades simplificadas

  constructor(
    private cursoService: CursoService,
    public authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private elementRef: ElementRef
  ) {
    this.cursoForm = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      codigo: ['', Validators.required],
      cargaHoraria: [null, [Validators.required, Validators.min(1)]],
      departamento: [null, Validators.required],
      descricao: ['']
    });
  }

  ngOnInit(): void {
    this.carregarCursos();
    this.carregarEstatisticas();
    // Filtros já configurados na declaração
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

  getPageTitle(): string {
    return 'Cursos';
  }

  getPageSubtitle(): string {
    return 'Explore, visualize, crie e edite os cursos oferecidos pela instituição.';
  }

  carregarCursos(): void {
    this.isLoading = true;
    this.cursoService.getTodosCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
        this.carregarEstatisticas();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Falha ao carregar os cursos.');
      }
    });
  }

  // Funcionalidades simplificadas

  abrirModal(curso?: Curso): void {
    this.isEditing = !!curso;
    if (curso) {
      this.cursoForm.setValue({
        id: curso.id,
        nome: curso.nome,
        codigo: curso.codigo,
        cargaHoraria: curso.cargaHoraria,
        departamento: curso.departamento,
        descricao: curso.descricao
      });
    } else {
      this.cursoForm.reset({ departamento: null });
    }
    this.isModalOpen = true;
  }

  fecharModal(): void {
    this.isModalOpen = false;
    this.cursoForm.reset();
  }

  salvarCurso(): void {
    if (this.cursoForm.invalid) {
      this.toastr.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const cursoData = this.cursoForm.value;
    const operacao = this.isEditing 
      ? this.cursoService.atualizarCurso(cursoData.id, cursoData)
      : this.cursoService.criarCurso(cursoData);
    
    operacao.subscribe({
      next: () => {
        this.toastr.success(`Curso ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`);
        this.carregarCursos();
        this.fecharModal();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || `Falha ao ${this.isEditing ? 'atualizar' : 'criar'} o curso.`);
      }
    });
  }

  confirmarDelecao(curso: Curso): void {
    this.cursoParaDeletar = curso;
  }

  fecharModalDelecao(): void {
    this.cursoParaDeletar = null;
  }

  deletarCurso(): void {
    if (!this.cursoParaDeletar) return;

    this.cursoService.deletarCurso(this.cursoParaDeletar.id!).subscribe({
      next: () => {
        this.toastr.success('Curso deletado com sucesso!');
        this.carregarCursos();
        this.fecharModalDelecao();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Falha ao deletar o curso.');
        this.fecharModalDelecao();
      }
    });
  }

  verDetalhes(curso: Curso): void {
    this.cursoDetalhes = curso;
  }

  fecharDetalhes(): void {
    this.cursoDetalhes = null;
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.fecharModal();
    }
  }

  onSearch(event: Event): void {
    this.termoBusca = (event.target as HTMLInputElement).value;
  }

  carregarEstatisticas(): void {
    this.isLoadingStats = true;

    // Calcular estatísticas baseadas nos dados carregados
    const totalCursos = this.cursos.length;
    const cargaHorariaTotal = this.cursos.reduce((total, curso) => total + (curso.cargaHoraria || 0), 0);
    const cargaHorariaMedia = totalCursos > 0 ? Math.round(cargaHorariaTotal / totalCursos) : 0;

    // Agrupar por departamento
    const departamentos = [...new Set(this.cursos.map(c => c.departamento))];
    const totalDepartamentos = departamentos.length;

    // Classificar por carga horária
    const cursosIntensivos = this.cursos.filter(c => (c.cargaHoraria || 0) >= 120).length;
    const cursosPopulares = this.cursos.filter(c => (c.cargaHoraria || 0) >= 80 && (c.cargaHoraria || 0) < 120).length;
    const cursosBasicos = this.cursos.filter(c => (c.cargaHoraria || 0) < 80).length;

    this.statsCards = [
      {
        title: 'Total de Cursos',
        value: totalCursos,
        icon: 'bi-mortarboard',
        color: 'primary',
        subtitle: `${totalDepartamentos} departamentos`
      },
      {
        title: 'Carga Horária Total',
        value: cargaHorariaTotal,
        icon: 'bi-clock-history',
        color: 'success',
        subtitle: `Média de ${cargaHorariaMedia}h por curso`
      },
      {
        title: 'Cursos Intensivos',
        value: cursosIntensivos,
        icon: 'bi-lightning',
        color: 'warning',
        subtitle: '120+ horas'
      },
      {
        title: 'Cursos Básicos',
        value: cursosBasicos,
        icon: 'bi-book',
        color: 'info',
        subtitle: 'Até 80 horas'
      }
    ];

    this.isLoadingStats = false;
  }

  // Métodos simplificados
}