import { Curso } from './../cursos/pagina/curso.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TurmaService } from './turma.service';
import { ToastrService } from 'ngx-toastr';
import { Turma } from './turma.model';
import { AuthService } from '../../service/auth/auth.service';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';
import { CursoService } from '../cursos/pagina/curso.service';
import { UsuarioService } from '../usuario/usuario.service';
import { Usuario } from '../usuario/usuario.model';

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProfileSwitcherComponent
  ],
  templateUrl: './turmas.html',
  styleUrls: ['./turmas.css']
})
export class TurmasComponent implements OnInit {
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

  constructor(
    private turmaService: TurmaService,
    private cursoService: CursoService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {
    this.turmaForm = this.fb.group({
      id: [null],
      cursoId: [null, Validators.required],
      ano: [null, [Validators.required, Validators.min(2000)]],
      semestre: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarCursos();
    this.canEditTurmas = this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR') || this.authService.isRoleActiveOrHigher('ROLE_ADMIN');
    this.canVincularAlunos = this.canEditTurmas;
    if (this.canVincularAlunos) {
      this.carregarAlunos();
    }
  }

  carregarTurmas(): void {
    this.turmaService.listar().subscribe({
      next: (turmas: Turma[]) => {
        this.turmas = turmas;
      },
      error: (error: any) => {
        console.error('Erro ao carregar turmas:', error);
        this.toastr.error('Erro ao carregar turmas. Tente novamente.');
      }
    });
  }

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

  excluirTurma(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      this.turmaService.excluir(id).subscribe({
        next: () => {
          this.carregarTurmas();
          this.toastr.success('Turma excluída com sucesso!');
        },
        error: (error: any) => {
          console.error('Erro ao excluir turma:', error);
          this.toastr.error('Erro ao excluir turma. Tente novamente.');
        }
      });
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.fecharModal();
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
} 