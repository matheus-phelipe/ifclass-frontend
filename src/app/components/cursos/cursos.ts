import { NovoCursoDTO, Curso } from './../../model/cursos/curso.model';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth/auth.service';
import { CursoService } from '../../service/curso/curso.service';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [FormsModule, CommonModule, ProfileSwitcherComponent],
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css']
})
export class CursosComponent implements OnInit {
  public cursos: Curso[] = [];
  public isLoading = true;
  public error: string | null = null;
  
  public mostrandoFormulario = false;
  public novoCurso: NovoCursoDTO = { nome: '', codigo: '', cargaHoraria: 0, departamento: '', descricao: '' };
  public cursoEmEdicao: Curso | null = null;
  public termoBusca = '';
  public cursoParaDeletar: Curso | null = null;
  public cursoDetalhes: Curso | null = null;
  public departamentosDisponiveis: string[] = ['Computação', 'Matemática', 'Física', 'Química', 'Engenharia', 'Outros'];

  constructor(
    private cursoService: CursoService,
    public authService: AuthService
  ) { }

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
    this.error = null;
    this.cursoService.getTodosCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Falha ao carregar os cursos. Tente novamente mais tarde.';
        this.isLoading = false;
        console.error('Erro ao carregar cursos:', err);
      }
    });
  }

  get cursosFiltrados(): Curso[] {
    if (!this.termoBusca) {
      return this.cursos;
    }
    const termo = this.termoBusca.toLowerCase();
    return this.cursos.filter(curso =>
      curso.nome.toLowerCase().includes(termo) ||
      curso.codigo.toLowerCase().includes(termo) ||
      curso.departamento.toLowerCase().includes(termo) ||
      curso.descricao.toLowerCase().includes(termo)
    );
  }

  abrirFormularioNovoCurso(): void {
    this.cursoEmEdicao = null;
    this.novoCurso = { nome: '', codigo: '', cargaHoraria: 0, departamento: '', descricao: '' };
    this.mostrandoFormulario = true;
  }

  editarCurso(curso: Curso): void {
    if (this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR')) {
      this.cursoEmEdicao = { ...curso };
      this.novoCurso = { ...curso };
      this.mostrandoFormulario = true;
    } else {
      this.error = 'Você não tem permissão para editar cursos.';
    }
  }

  salvarCurso(): void {
    this.error = null;

    if (this.cursoEmEdicao) {
      if (this.cursoEmEdicao.id) {
        this.cursoService.atualizarCurso(this.cursoEmEdicao.id, this.novoCurso as NovoCursoDTO).subscribe({
          next: () => {
            this.carregarCursos();
            this.mostrandoFormulario = false;
            this.cursoEmEdicao = null;
            this.novoCurso = { nome: '', codigo: '', cargaHoraria: 0, departamento: '', descricao: '' };
            this.error = 'Curso atualizado com sucesso!'; // Feedback de sucesso
            setTimeout(() => this.error = null, 3000);
          },
          error: (err) => {
            this.error = err.error?.message || 'Falha ao atualizar curso. Verifique os dados.'; // Usa mensagem do backend
            console.error('Erro ao atualizar curso:', err);
          }
        });
      }
    } else {
      this.cursoService.criarCurso(this.novoCurso).subscribe({
        next: () => {
          this.carregarCursos();
          this.mostrandoFormulario = false;
          this.novoCurso = { nome: '', codigo: '', cargaHoraria: 0, departamento: '', descricao: '' };
          this.error = 'Curso criado com sucesso!'; // Feedback de sucesso
          setTimeout(() => this.error = null, 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Falha ao criar curso. Verifique os dados.'; // Usa mensagem do backend
          console.error('Erro ao criar curso:', err);
        }
      });
    }
  }

  cancelarEdicaoOuCriacao(): void {
    this.mostrandoFormulario = false;
    this.cursoEmEdicao = null;
    this.novoCurso = { nome: '', codigo: '', cargaHoraria: 0, departamento: '', descricao: '' };
  }

  confirmarDelecao(curso: Curso): void {
    if (this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR')) {
      this.cursoParaDeletar = curso;
      this.abrirModal('confirmDeleteModal');
    } else {
      this.error = 'Você não tem permissão para deletar cursos.';
    }
  }

  deletarCurso(): void {
    if (this.cursoParaDeletar && this.cursoParaDeletar.id) {
      this.cursoService.deletarCurso(this.cursoParaDeletar.id).subscribe({
        next: () => {
          this.carregarCursos();
          this.fecharModalDelecao();
          this.cursoParaDeletar = null;
          this.error = 'Curso deletado com sucesso!'; // Feedback de sucesso
          setTimeout(() => this.error = null, 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Falha ao deletar curso.'; // Usa mensagem do backend
          console.error('Erro ao deletar curso:', err);
          this.fecharModalDelecao();
        }
      });
    }
  }

  fecharModalDelecao(): void {
    this.cursoParaDeletar = null;
    this.fecharModal('confirmDeleteModal');
  }

  verDetalhes(curso: Curso): void {
    this.cursoDetalhes = curso;
    this.abrirModal('detalhesCursoModal');
  }

  fecharDetalhes(): void {
    this.cursoDetalhes = null;
    this.fecharModal('detalhesCursoModal');
  }

  private abrirModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      modalElement.setAttribute('aria-modal', 'true');
      modalElement.setAttribute('role', 'dialog');
      document.body.classList.add('modal-open');
    }
  }

  private fecharModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
      modalElement.removeAttribute('aria-modal');
      modalElement.removeAttribute('role');
      document.body.classList.remove('modal-open');
    }
  }
}