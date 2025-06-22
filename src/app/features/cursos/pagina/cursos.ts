import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Curso } from './curso.model';
import { CursoService } from './curso.service';
import { AuthService } from '../../../service/auth/auth.service';
import { ProfileSwitcherComponent } from '../../../shared/profile-switcher/profile-switcher';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileSwitcherComponent],
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css']
})
export class CursosComponent implements OnInit {
  cursos: Curso[] = [];
  cursoForm: FormGroup;
  isLoading = true;
  isModalOpen = false;
  isEditing = false;
  
  termoBusca = '';
  cursoDetalhes: Curso | null = null;
  cursoParaDeletar: Curso | null = null;
  
  departamentosDisponiveis: string[] = ['Computação', 'Matemática', 'Física', 'Química', 'Engenharia', 'Outros'];

  constructor(
    private cursoService: CursoService,
    public authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
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
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Falha ao carregar os cursos.');
      }
    });
  }

  get cursosFiltrados(): Curso[] {
    const termo = this.termoBusca.toLowerCase();
    if (!termo) {
      return this.cursos;
    }
    return this.cursos.filter(curso =>
      curso.nome.toLowerCase().includes(termo) ||
      curso.codigo.toLowerCase().includes(termo) ||
      curso.departamento.toLowerCase().includes(termo)
    );
  }

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
}