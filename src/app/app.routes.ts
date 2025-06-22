import { Routes } from '@angular/router';
import { authGuard } from './service/auth/auth.guard';
import { LoginComponent } from './features/usuario/login/login';
import { CadastroComponent } from './features/usuario/cadastro/cadastro';
import { ResetarSenhaComponent } from './features/usuario/resetar-senha/resetar-senha';
import { Home } from './features/home/home';
import { Gerenciarusuarios } from './features/gerenciarusuarios/gerenciarusuarios';
import { GerenciadorSalasComponent } from './features/aluno/gerenciador-salas/gerenciador-salas';
import { CursosComponent } from './features/cursos/pagina/cursos';
import { MapaAlunoComponent } from './features/aluno/mapa-aluno/mapa-aluno';
import { TurmasComponent } from './features/turmas/turmas';
import { DisciplinasComponent } from './features/disciplinas/disciplinas';
import { VinculoProfessorDisciplinaComponent } from './features/vinculo-professor-disciplina/vinculo-professor-disciplina';
import { CriarAulaComponent } from './features/aulas/criar-aula/criar-aula';

export const routes: Routes = [
  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'resetar-senha', component: ResetarSenhaComponent },

  // --- Layout e Rotas do Aluno ---
  {
    path: 'aluno',
    canActivate: [authGuard],
    data: { authorities: ['ROLE_ALUNO', 'ROLE_ADMIN'] },
    children: [
      { path: 'mapa', component: MapaAlunoComponent },
      { path: '', redirectTo: 'mapa', pathMatch: 'full' }
    ]
  },

  // --- Layout e Rotas Principais (Admin, Coordenador, Professor) ---
    {
    path: 'app',
    children: [
      {
        path: 'home',
        component: Home,
        canActivate: [authGuard], 
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'usuarios',
        component: Gerenciarusuarios,
        canActivate: [authGuard],
        data: { authorities: ['ROLE_ADMIN'] }
      },
      {
        path: 'salas',
        component: GerenciadorSalasComponent,
        canActivate: [authGuard], 
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'cursos',
        component: CursosComponent,
        canActivate: [authGuard], 
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'turmas',
        component: TurmasComponent,
        canActivate: [authGuard], 
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'disciplinas',
        component: DisciplinasComponent,
        canActivate: [authGuard], 
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }      },
      {
        path: 'vinculo-professor-disciplina',
        component: VinculoProfessorDisciplinaComponent,
        canActivate: [authGuard], 
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'criar-aula',
        component: CriarAulaComponent,
        canActivate: [authGuard], 
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // Rota de fallback
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];