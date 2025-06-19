import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-criar-aula',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileSwitcherComponent],
  templateUrl: './criar-aula.html',
  styleUrls: ['./criar-aula.css']
})
export class CriarAulaComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private aulaService: AulaService,
    private turmaService: TurmaService,
    private disciplinaService: DisciplinaService,
    private usuarioService: UsuarioService,
    private blocoService: BlocoService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      sala: [null, Validators.required],
      turma: [null, Validators.required],
      disciplina: [null, Validators.required],
      professor: [null, Validators.required],
      data: [null, Validators.required],
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
  }

  criarAula() {
    this.sucesso = '';
    this.erro = '';
    if (this.form.invalid) return;
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
    const aula = {
      sala,
      turma,
      disciplina,
      professor,
      data: this.form.value.data,
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

  getBlocoNome(salaId: number): string {
    const bloco = this.blocos.find(b => b.salas.some(s => s.id === salaId));
    return bloco ? bloco.nome : '-';
  }

  carregarAulas() {
    if (this.perfil === 'ROLE_PROFESSOR' && this.usuarioId) {
      this.aulaService.buscarPorProfessor(this.usuarioId).subscribe({
        next: aulas => this.aulas = aulas
      });
    } else {
      this.aulaService.buscarTodas().subscribe({
        next: aulas => this.aulas = aulas
      });
    }
  }
}
