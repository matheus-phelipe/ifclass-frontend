import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../usuario/usuario.service';
import { DisciplinaService } from '../disciplinas/disciplina.service';
import { Usuario } from '../usuario/usuario.model';
import { Disciplina } from '../disciplinas/disciplina.model';
import { ProfileSwitcherComponent } from '../../shared/profile-switcher/profile-switcher';
import { AuthService } from '../../service/auth/auth.service';

@Component({
  selector: 'app-vinculo-professor-disciplina',
  standalone: true,
  imports: [CommonModule, ProfileSwitcherComponent],
  templateUrl: './vinculo-professor-disciplina.html',
  styleUrls: ['./vinculo-professor-disciplina.css']
})
export class VinculoProfessorDisciplinaComponent implements OnInit {
  professores: Usuario[] = [];
  disciplinas: Disciplina[] = [];
  disciplinasVinculadas: Disciplina[] = [];
  professorSelecionado?: Usuario;
  professorSelecionadoId?: number;
  carregando = false;
  erro = '';
  podeEditar = false;

  constructor(
    private usuarioService: UsuarioService,
    private disciplinaService: DisciplinaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.podeEditar = this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR') || this.authService.isRoleActiveOrHigher('ROLE_ADMIN');
    this.carregarProfessores();
    this.carregarDisciplinas();
  }

  carregarProfessores() {
    this.usuarioService.listarTodos().subscribe({
      next: (usuarios) => {
        this.professores = usuarios.filter(u => u.authorities.includes('ROLE_PROFESSOR'));
      },
      error: () => this.erro = 'Erro ao carregar professores.'
    });
  }

  carregarDisciplinas() {
    this.disciplinaService.listar().subscribe({
      next: (disciplinas) => this.disciplinas = disciplinas,
      error: () => this.erro = 'Erro ao carregar disciplinas.'
    });
  }

  selecionarProfessorPorId(profId: string) {
    const id = Number(profId);
    if (this.professorSelecionadoId === id) {
      this.professorSelecionadoId = undefined;
      this.professorSelecionado = undefined;
      this.disciplinasVinculadas = [];
      return;
    }
    const prof = this.professores.find(p => p.id === id);
    if (prof) {
      this.professorSelecionadoId = id;
      this.professorSelecionado = prof;
      this.carregando = true;
      this.usuarioService.listarDisciplinas(prof.id).subscribe({
        next: (disciplinas) => {
          this.disciplinasVinculadas = disciplinas;
          this.carregando = false;
        },
        error: () => {
          this.erro = 'Erro ao buscar disciplinas do professor.';
          this.carregando = false;
        }
      });
    } else {
      this.professorSelecionadoId = undefined;
      this.professorSelecionado = undefined;
      this.disciplinasVinculadas = [];
    }
  }

  estaVinculada(disc: Disciplina): boolean {
    return this.disciplinasVinculadas.some(d => d.id === disc.id);
  }

  alternarVinculo(disc: Disciplina) {
    if (!this.podeEditar || !this.professorSelecionado) return;
    this.carregando = true;
    const id = this.professorSelecionado.id;
    const reload = () => {
      this.usuarioService.listarDisciplinas(id).subscribe({
        next: (disciplinas) => {
          this.disciplinasVinculadas = disciplinas;
          this.carregando = false;
        },
        error: () => {
          this.erro = 'Erro ao atualizar disciplinas do professor.';
          this.carregando = false;
        }
      });
    };
    if (this.estaVinculada(disc)) {
      this.usuarioService.desvincularDisciplina(id, disc.id!).subscribe({
        next: reload,
        error: () => {
          this.erro = 'Erro ao desvincular disciplina.';
          this.carregando = false;
        }
      });
    } else {
      this.usuarioService.vincularDisciplina(id, disc.id!).subscribe({
        next: reload,
        error: () => {
          this.erro = 'Erro ao vincular disciplina.';
          this.carregando = false;
        }
      });
    }
  }
}
