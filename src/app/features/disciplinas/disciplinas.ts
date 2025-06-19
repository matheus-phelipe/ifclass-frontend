import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DisciplinaService } from './disciplina.service';
import { Disciplina } from './disciplina.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth/auth.service';
import { Curso } from '../cursos/pagina/curso.model';
import { CursoService } from '../cursos/pagina/curso.service';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';

@Component({
  selector: 'app-disciplinas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileSwitcherComponent],
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

  constructor(
    private disciplinaService: DisciplinaService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private cursoService: CursoService
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
    this.carregarDisciplinas();
    this.carregarCursos();
    this.canEditDisciplinas = this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR') || this.authService.isRoleActiveOrHigher('ROLE_ADMIN');
  }

  carregarDisciplinas(): void {
    this.disciplinaService.listar().subscribe({
      next: (disciplinas: Disciplina[]) => {
        this.disciplinas = disciplinas;
      },
      error: (error: any) => {
        console.error('Erro ao carregar disciplinas:', error);
        this.toastr.error('Erro ao carregar disciplinas. Tente novamente.');
      }
    });
  }

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
} 