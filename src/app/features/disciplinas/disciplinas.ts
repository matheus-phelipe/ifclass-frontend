import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DisciplinaService } from './disciplina.service';
import { Disciplina } from './disciplina.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth/auth.service';
import { Curso } from '../cursos/pagina/curso.model';
import { CursoService } from '../cursos/pagina/curso.service';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';
import { Router } from '@angular/router';
import { DashboardStatsComponent, StatCard } from '../../shared/dashboard-stats/dashboard-stats.component';
import { FilterPipe } from '../../shared/pipes/filter.pipe';

@Component({
  selector: 'app-disciplinas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ProfileSwitcherComponent, FilterPipe, DashboardStatsComponent],
  templateUrl: './disciplinas.html',
  styleUrls: ['./disciplinas.css']
})
export class DisciplinasComponent implements OnInit {
  disciplinas: Disciplina[] = [];
  disciplinaForm: FormGroup;
  isModalOpen = false;
  isEditing = false;
  canEditDisciplinas = false;
  cursos: Curso[] = [];

  // Busca simples
  termoBusca = '';

  // Estatísticas
  statsCards: StatCard[] = [];
  isLoadingStats = true;

  constructor(
    private disciplinaService: DisciplinaService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private cursoService: CursoService,
    private router: Router,

  ) {
    this.disciplinaForm = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      codigo: ['', Validators.required],
      cargaHoraria: [null, [Validators.required, Validators.min(1)]],
      departamento: ['', Validators.required],
      descricao: [''],
      cursoId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.getActiveRole() === 'ROLE_ALUNO') {
      this.router.navigate(['/aluno/mapa']);
      return;
    }
    this.carregarDisciplinas();
    this.carregarCursos();
    this.canEditDisciplinas = this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR') || this.authService.isRoleActiveOrHigher('ROLE_ADMIN');
    this.carregarEstatisticas();
  }

  carregarDisciplinas(): void {
    this.disciplinaService.listar().subscribe({
      next: (disciplinas: Disciplina[]) => {
        this.disciplinas = disciplinas;
        this.carregarEstatisticas();
      },
      error: (error: any) => {
        console.error('Erro ao carregar disciplinas:', error);
        this.toastr.error('Erro ao carregar disciplinas. Tente novamente.');
      }
    });
  }

  // Funcionalidades simplificadas

  carregarCursos(): void {
    this.cursoService.getTodosCursos().subscribe({
      next: (cursos: Curso[]) => {
        this.cursos = cursos;
      },
      error: (error: any) => {
        console.error('Erro ao carregar cursos:', error);
        this.toastr.error('Erro ao carregar cursos. Tente novamente.');
      }
    });
  }

  abrirModal(disciplina?: Disciplina): void {
    this.isEditing = !!disciplina;
    if (disciplina) {
      this.disciplinaForm.patchValue({
        ...disciplina,
        cursoId: disciplina.curso?.id || null
      });
    } else {
      this.disciplinaForm.reset();
    }
    this.isModalOpen = true;
  }

  fecharModal(): void {
    this.isModalOpen = false;
    this.disciplinaForm.reset();
    this.isEditing = false;
  }

  salvarDisciplina(): void {
    if (this.disciplinaForm.valid) {
      const disciplinaData = {
        ...this.disciplinaForm.value,
        cargaHoraria: Number(this.disciplinaForm.value.cargaHoraria)
      };

      if (this.disciplinaForm.value.id) {
        this.disciplinaService.atualizar(disciplinaData).subscribe({
          next: () => {
            this.carregarDisciplinas();
            this.fecharModal();
            this.toastr.success('Disciplina atualizada com sucesso!');
          },
          error: (error: any) => {
            console.error('Erro ao atualizar disciplina:', error);
            this.toastr.error('Erro ao atualizar disciplina. Tente novamente.');
          }
        });
      } else {
        this.disciplinaService.criar(disciplinaData).subscribe({
          next: () => {
            this.carregarDisciplinas();
            this.fecharModal();
            this.toastr.success('Disciplina criada com sucesso!');
          },
          error: (error: any) => {
            console.error('Erro ao criar disciplina:', error);
            this.toastr.error('Erro ao criar disciplina. Tente novamente.');
          }
        });
      }
    }
  }

  excluirDisciplina(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
      this.disciplinaService.excluir(id).subscribe({
        next: () => {
          this.carregarDisciplinas();
          this.toastr.success('Disciplina excluída com sucesso!');
        },
        error: (error: any) => {
          console.error('Erro ao excluir disciplina:', error);
          this.toastr.error('Erro ao excluir disciplina. Tente novamente.');
        }
      });
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.fecharModal();
    }
  }

  carregarEstatisticas(): void {
    this.isLoadingStats = true;

    // Calcular estatísticas baseadas nos dados carregados
    const totalDisciplinas = this.disciplinas.length;
    const cargaHorariaTotal = this.disciplinas.reduce((total, disc) => total + (disc.cargaHoraria || 0), 0);
    const cargaHorariaMedia = totalDisciplinas > 0 ? Math.round(cargaHorariaTotal / totalDisciplinas) : 0;

    // Agrupar por departamento
    const departamentos = [...new Set(this.disciplinas.map(d => d.departamento))];
    const totalDepartamentos = departamentos.length;

    // Classificar por carga horária
    const disciplinasLongas = this.disciplinas.filter(d => (d.cargaHoraria || 0) >= 80).length;
    const disciplinasMedias = this.disciplinas.filter(d => (d.cargaHoraria || 0) >= 40 && (d.cargaHoraria || 0) < 80).length;
    const disciplinasCurtas = this.disciplinas.filter(d => (d.cargaHoraria || 0) < 40).length;

    this.statsCards = [
      {
        title: 'Total de Disciplinas',
        value: totalDisciplinas,
        icon: 'bi-journal-bookmark',
        color: 'primary',
        subtitle: `${totalDepartamentos} departamentos`
      },
      {
        title: 'Carga Horária Total',
        value: cargaHorariaTotal,
        icon: 'bi-clock-history',
        color: 'success',
        subtitle: `Média de ${cargaHorariaMedia}h por disciplina`
      },
      {
        title: 'Disciplinas Longas',
        value: disciplinasLongas,
        icon: 'bi-hourglass-top',
        color: 'warning',
        subtitle: '80+ horas'
      },
      {
        title: 'Disciplinas Curtas',
        value: disciplinasCurtas,
        icon: 'bi-hourglass-bottom',
        color: 'info',
        subtitle: 'Até 40 horas'
      }
    ];

    this.isLoadingStats = false;
  }
}