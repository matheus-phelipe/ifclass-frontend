import { Curso } from './../cursos/pagina/curso.model';
import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;
import { TurmaService } from './turma.service';
import { ToastrService } from 'ngx-toastr';
import { Turma } from './turma.model';
import { AuthService } from '../../service/auth/auth.service';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';
import { CursoService } from '../cursos/pagina/curso.service';
import { UsuarioService } from '../usuario/usuario.service';
import { Usuario } from '../usuario/usuario.model';
import { Router } from '@angular/router';
import { DashboardStatsComponent, StatCard } from '../../shared/dashboard-stats/dashboard-stats.component';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { NotificationService } from '../../shared/sweetalert/notification.service';

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProfileSwitcherComponent,
    FilterPipe,
    DashboardStatsComponent
  ],
  templateUrl: './turmas.html',
  styleUrls: ['./turmas.css']
})
export class TurmasComponent implements OnInit, AfterViewInit {
  turmas: Turma[] = [];
  cursos: Curso[] = [];
  turmaForm: FormGroup;
  isModalOpen = false;
  isEditing = false;
  canEditTurmas = false;
  alunos: Usuario[] = [];
  isVincularModalOpen = false;
  selectedTurmaId: number | null = null;
  selectedAlunosIds: number[] = [];
  canVincularAlunos = false;
  alunosVinculados: Usuario[] = [];
  isAlunosVinculadosModalOpen = false;

  // Busca simples
  termoBusca = '';
  currentYear = new Date().getFullYear();

  // Estatísticas
  statsCards: StatCard[] = [];
  isLoadingStats = true;

  constructor(
    private turmaService: TurmaService,
    private cursoService: CursoService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private elementRef: ElementRef,
    private notificationService: NotificationService
  ) {
    this.turmaForm = this.fb.group({
      id: [null],
      cursoId: [null, Validators.required],
      ano: [null, [Validators.required, Validators.min(2000)]],
      semestre: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.getActiveRole() === 'ROLE_ALUNO') {
      this.router.navigate(['/aluno/mapa']);
      return;
    }
    this.carregarTurmas();
    this.carregarCursos();
    // Filtros já configurados na declaração
    this.canEditTurmas = this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR') || this.authService.isRoleActiveOrHigher('ROLE_ADMIN');
    this.canVincularAlunos = this.canEditTurmas;
    if (this.canVincularAlunos) {
      this.carregarAlunos();
    }
    this.carregarEstatisticas();
  }

  ngAfterViewInit(): void {
    // Inicializar tooltips do Bootstrap
    this.initializeTooltips();
    // Configurar posicionamento dos preview cards
    this.setupPreviewPositioning();
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

  setupPreviewPositioning(): void {
    setTimeout(() => {
      const cards = this.elementRef.nativeElement.querySelectorAll('.turma-card');
      cards.forEach((card: HTMLElement) => {
        this.adjustPreviewPosition(card);
      });
    }, 200);
    
    // Listener para redimensionamento da janela
    window.addEventListener('resize', () => {
      this.setupPreviewPositioning();
    });
  }

  adjustPreviewPosition(card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = 280;
    const previewHeight = 200;
    
    // Remove classes anteriores
    card.classList.remove('preview-left', 'preview-top', 'preview-bottom');
    
    // Verifica se está no canto direito da tela
    const isNearRightEdge = rect.right > viewportWidth - (previewWidth + 20);
    
    // Verifica se está no canto inferior da tela
    const isNearBottomEdge = rect.bottom > viewportHeight - (previewHeight + 20);
    
    // Verifica se está no canto esquerdo da tela
    const isNearLeftEdge = rect.left < 20;
    
    // Verifica se está no canto superior da tela
    const isNearTopEdge = rect.top < 20;
    
    // Lógica mais específica para evitar sobreposição
    if (isNearRightEdge && !isNearLeftEdge) {
      // Se está no canto direito, mostra à esquerda
      card.classList.add('preview-left');
    } else if (isNearBottomEdge && !isNearTopEdge) {
      // Se está no canto inferior, mostra acima
      card.classList.add('preview-top');
    } else if (isNearTopEdge && !isNearBottomEdge) {
      // Se está no canto superior, mostra abaixo
      card.classList.add('preview-bottom');
    }
    // Se não está em nenhum canto, usa o comportamento padrão (direita)
  }

  carregarTurmas(): void {
    this.turmaService.listar().subscribe({
      next: (turmas: Turma[]) => {
        this.turmas = turmas;
        this.carregarEstatisticas();
        // Reposicionar previews após carregar dados
        setTimeout(() => {
          this.setupPreviewPositioning();
        }, 300);
      },
      error: (error: any) => {
        console.error('Erro ao carregar turmas:', error);
        this.toastr.error('Erro ao carregar turmas. Tente novamente.');
      }
    });
  }

  // Funcionalidades simplificadas

  carregarCursos(): void {
    this.cursoService.listar().subscribe({
      next: (cursos: Curso[]) => {
        this.cursos = cursos;
      },
      error: (error: any) => {
        console.error('Erro ao carregar cursos:', error);
        this.toastr.error('Erro ao carregar cursos. Tente novamente.');
      }
    });
  }

  carregarAlunos(): void {
    this.usuarioService.listarTodos().subscribe({
      next: (alunos: Usuario[]) => {
        this.turmaService.listarIdsAlunosVinculados().subscribe({
          next: (idsVinculados: number[]) => {
            this.alunos = alunos.filter(a => a.authorities.includes('ROLE_ALUNO') && !idsVinculados.includes(a.id));
          },
          error: () => {
            this.alunos = alunos.filter(a => a.authorities.includes('ROLE_ALUNO'));
          }
        });
      },
      error: (error: any) => {
        this.toastr.error('Erro ao carregar alunos.');
      }
    });
  }

  desvincularAluno(alunoId: number, turmaId: number): void {
    this.turmaService.desvincularAlunoDaTurma(alunoId).subscribe({
      next: () => {
        this.toastr.success('Aluno desvinculado com sucesso!');
        this.abrirAlunosVinculadosModal(turmaId);
        this.carregarAlunos();
      },
      error: () => {
        this.toastr.error('Erro ao desvincular aluno.');
      }
    });
  }

  abrirModal(turma?: Turma): void {
    this.isEditing = !!turma;
    if (turma) {
      this.turmaForm.patchValue({
        id: turma.id,
        cursoId: turma.curso?.id,
        ano: turma.ano,
        semestre: turma.semestre
      });
    } else {
      this.turmaForm.reset();
    }
    this.isModalOpen = true;
  }

  fecharModal(): void {
    this.isModalOpen = false;
    this.turmaForm.reset();
    this.isEditing = false;
  }

  salvarTurma(): void {
    if (this.turmaForm.valid) {
      const turmaData = {
        ...this.turmaForm.value,
        ano: Number(this.turmaForm.value.ano) // Garantir que ano seja número
      };

      if (this.turmaForm.value.id) {
        this.turmaService.atualizar(turmaData).subscribe({
          next: () => {
            this.carregarTurmas();
            this.fecharModal();
            this.toastr.success('Turma atualizada com sucesso!');
          },
          error: (error: any) => {
            console.error('Erro ao atualizar turma:', error);
            this.toastr.error('Erro ao atualizar turma. Tente novamente.');
          }
        });
      } else {
        this.turmaService.criar(turmaData).subscribe({
          next: () => {
            this.carregarTurmas();
            this.fecharModal();
            this.toastr.success('Turma criada com sucesso!');
          },
          error: (error: any) => {
            console.error('Erro ao criar turma:', error);
            this.toastr.error('Erro ao criar turma. Tente novamente.');
          }
        });
      }
    }
  }

  async excluirTurma(id: number): Promise<void> {
    const turma = this.turmas.find(t => t.id === id);
    const turmaNome = turma ? `${turma.curso?.nome} - ${turma.ano}/${turma.semestre}º semestre` : 'esta turma';
    
    const confirmado = await this.notificationService.confirm(
      'Excluir Turma',
      `Tem certeza que deseja excluir ${turmaNome}?`,
      'Sim, excluir'
    );
    
    if (confirmado) {
      this.turmaService.excluir(id).subscribe({
        next: () => {
          this.carregarTurmas();
          this.notificationService.success(
            'Turma Excluída',
            `${turmaNome} foi excluída com sucesso!`
          );
        },
        error: (error: any) => {
          console.error('Erro ao excluir turma:', error);
          this.notificationService.error(
            'Erro ao Excluir',
            error.error?.message || 'Não foi possível excluir a turma. Tente novamente.'
          );
        }
      });
    }
  }

  onBackdropClick(event: MouseEvent, modalType: string) {
    if (event.target === event.currentTarget) {
      if (modalType === 'vincular') {
        this.fecharVincularModal();
      } else if (modalType === 'alunos') {
        this.fecharAlunosVinculadosModal();
      } else if (modalType === 'main') {
        this.fecharModal();
      } else {
        this.fecharModal();
      }
    }
  }

  abrirVincularModal(turmaId: number): void {
    if (this.isVincularModalOpen && this.selectedTurmaId === turmaId) return;
    this.selectedTurmaId = turmaId;
    this.selectedAlunosIds = [];
    this.isVincularModalOpen = true;
  }

  fecharVincularModal(): void {
    this.isVincularModalOpen = false;
    this.selectedTurmaId = null;
    this.selectedAlunosIds = [];
  }

  vincularAlunosNaTurma(): void {
    if (!this.selectedTurmaId || this.selectedAlunosIds.length === 0) return;
    this.turmaService.vincularAlunosEmLote(this.selectedTurmaId, this.selectedAlunosIds).subscribe({
      next: () => {
        this.toastr.success('Alunos vinculados com sucesso!');
        this.fecharVincularModal();
        this.carregarAlunos();
      },
      error: () => {
        this.toastr.error('Erro ao vincular alunos.');
      }
    });
  }

  abrirAlunosVinculadosModal(turmaId: number): void {
    this.selectedTurmaId = turmaId;
    this.turmaService.listarAlunosPorTurma(turmaId).subscribe({
      next: (alunos: Usuario[]) => {
        this.alunosVinculados = alunos;
        this.isAlunosVinculadosModalOpen = true;
      },
      error: () => {
        this.toastr.error('Erro ao carregar alunos vinculados.');
      }
    });
  }

  fecharAlunosVinculadosModal(): void {
    this.isAlunosVinculadosModalOpen = false;
    this.alunosVinculados = [];
  }

  getStatusText(turma: Turma): string {
    if (turma.ano === this.currentYear) {
      return 'Atual';
    } else if (turma.ano < this.currentYear) {
      return 'Passado';
    } else {
      return 'Futuro';
    }
  }

  getStatusTooltip(turma: Turma): string {
    if (turma.ano === this.currentYear) {
      return `Turma em andamento - ${turma.ano}/${turma.semestre}º semestre`;
    } else if (turma.ano < this.currentYear) {
      return `Turma finalizada em ${turma.ano}/${turma.semestre}º semestre`;
    } else {
      return `Turma programada para ${turma.ano}/${turma.semestre}º semestre`;
    }
  }

  carregarEstatisticas(): void {
    this.isLoadingStats = true;

    // Calcular estatísticas baseadas nos dados carregados
    const totalTurmas = this.turmas.length;
    const turmasAtuais = this.turmas.filter(t => t.ano === this.currentYear).length;
    const turmasPassadas = this.turmas.filter(t => t.ano < this.currentYear).length;
    const turmasFuturas = this.turmas.filter(t => t.ano > this.currentYear).length;

    // Agrupar por curso
    const cursosUnicos = [...new Set(this.turmas.map(t => t.curso?.nome).filter(Boolean))];
    const totalCursos = cursosUnicos.length;

    // Semestres
    const primeiroSemestre = this.turmas.filter(t => t.semestre === 1).length;
    const segundoSemestre = this.turmas.filter(t => t.semestre === 2).length;

    this.statsCards = [
      {
        title: 'Total de Turmas',
        value: totalTurmas,
        icon: 'bi-people',
        color: 'primary',
        subtitle: `${totalCursos} cursos diferentes`
      },
      {
        title: 'Turmas Atuais',
        value: turmasAtuais,
        icon: 'bi-calendar-check',
        color: 'success',
        subtitle: `Ano ${this.currentYear}`
      },
      {
        title: '1º Semestre',
        value: primeiroSemestre,
        icon: 'bi-1-circle',
        color: 'warning',
        subtitle: 'Turmas do 1º semestre'
      },
      {
        title: '2º Semestre',
        value: segundoSemestre,
        icon: 'bi-2-circle',
        color: 'info',
        subtitle: 'Turmas do 2º semestre'
      }
    ];

    this.isLoadingStats = false;
  }
}