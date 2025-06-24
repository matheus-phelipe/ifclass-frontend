import { Routes } from '@angular/router';
import { authGuard } from './service/auth/auth.guard';

// Apenas componentes críticos para o bundle inicial (login, cadastro, etc.)
import { LoginComponent } from './features/usuario/login/login';
import { CadastroComponent } from './features/usuario/cadastro/cadastro';
import { ResetarSenhaComponent } from './features/usuario/resetar-senha/resetar-senha';

export const routes: Routes = [
  // Rotas públicas (carregamento imediato para UX)
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'resetar-senha', component: ResetarSenhaComponent },

  // --- Layout e Rotas do Aluno (Lazy Loading) ---
  {
    path: 'aluno',
    canActivate: [authGuard],
    data: { authorities: ['ROLE_ALUNO', 'ROLE_ADMIN'] },
    children: [
      {
        path: 'mapa',
        loadComponent: () => import('./features/aluno/mapa-aluno/mapa-aluno').then(m => m.MapaAlunoComponent)
      },
      { path: '', redirectTo: 'mapa', pathMatch: 'full' }
    ]
  },

  // --- Layout e Rotas Principais (Lazy Loading) ---
  {
    path: 'app',
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home').then(m => m.Home),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/gerenciarusuarios/gerenciarusuarios').then(m => m.Gerenciarusuarios),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_ADMIN'] }
      },
      {
        path: 'salas',
        loadComponent: () => import('./features/aluno/gerenciador-salas/gerenciador-salas').then(m => m.GerenciadorSalasComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'cursos',
        loadComponent: () => import('./features/cursos/pagina/cursos').then(m => m.CursosComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'turmas',
        loadComponent: () => import('./features/turmas/turmas').then(m => m.TurmasComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'disciplinas',
        loadComponent: () => import('./features/disciplinas/disciplinas').then(m => m.DisciplinasComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'vinculo-professor-disciplina',
        loadComponent: () => import('./features/vinculo-professor-disciplina/vinculo-professor-disciplina').then(m => m.VinculoProfessorDisciplinaComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'criar-aula',
        loadComponent: () => import('./features/aulas/criar-aula/criar-aula').then(m => m.CriarAulaComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },
      {
        path: 'aulas-do-dia',
        loadComponent: () => import('./features/aulas/aulas-do-dia/aulas-do-dia').then(m => m.AulasDoDiaComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_PROFESSOR', 'ROLE_ADMIN', 'ROLE_COORDENADOR'] }
      },

      // Rotas de Coordenação (Lazy Loading)
      {
        path: 'coordenacao/dashboard',
        loadComponent: () => import('./features/coordenacao/dashboard/coordenacao-dashboard.component').then(m => m.CoordenacaoDashboardComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_COORDENADOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'coordenacao/professores',
        loadComponent: () => import('./features/coordenacao/professores/gestao-professores.component').then(m => m.GestaoProfessoresComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_COORDENADOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'coordenacao/horarios',
        loadComponent: () => import('./features/coordenacao/horarios/gestao-horarios.component').then(m => m.GestaoHorariosComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_COORDENADOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'coordenacao/relatorios',
        loadComponent: () => import('./features/coordenacao/relatorios/relatorios-coordenacao.component').then(m => m.RelatoriosCoordenacaoComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_COORDENADOR', 'ROLE_ADMIN'] }
      },

      // Rotas de Administração (Lazy Loading)
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_ADMIN'] }
      },
      {
        path: 'admin/sistema',
        loadComponent: () => import('./features/admin/sistema/admin-sistema.component').then(m => m.AdminSistemaComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_ADMIN'] }
      },
      {
        path: 'admin/configuracoes',
        loadComponent: () => import('./features/admin/configuracoes/admin-configuracoes.component').then(m => m.AdminConfiguracoesComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_ADMIN'] }
      },
      {
        path: 'admin/logs',
        loadComponent: () => import('./features/admin/logs/admin-logs.component').then(m => m.AdminLogsComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_ADMIN'] }
      },
      {
        path: 'admin/analytics',
        loadComponent: () => import('./features/admin/analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_ADMIN'] }
      },
      {
        path: 'admin/analytics',
        loadComponent: () => import('./features/admin/analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
        canActivate: [authGuard],
        data: { authorities: ['ROLE_ADMIN'] }
      },

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // Rota de fallback
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];