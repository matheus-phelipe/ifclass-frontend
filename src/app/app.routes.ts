import { LoginComponent } from './components/usuario/login/login';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { authGuard } from './service/auth/auth.guard';
import { CadastroComponent } from './components/usuario/cadastro/cadastro';
import { Gerenciarusuarios } from './components/gerenciarusuarios/gerenciarusuarios';
import { Gerenciarpermissoes } from './components/gerenciarpermissoes/gerenciarpermissoes';
import { GerenciadorSalasComponent } from './components/gerenciador-salas/gerenciador-salas';
import { CursosComponent } from './components/cursos/cursos';
import { ResetarSenhaComponent } from './components/usuario/resetar-senha/resetar-senha';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  {
    path: 'home',
    component: Home,
    canActivate: [authGuard] // protege a rota
  },
  {
    path: 'usuarios',
    component: Gerenciarusuarios,
    canActivate: [authGuard],
    data: { authorities: ['ROLE_ADMIN'] }
  },
  {
    path: 'permissoes',
    component: Gerenciarpermissoes,
    canActivate: [authGuard],
    data: { authorities: ['ROLE_ADMIN', 'ROLE_COORDENADOR'] }
  },
  {
    path: 'salas',
    component: GerenciadorSalasComponent,
    canActivate: [authGuard]
  },
  {
    path: 'cursos',
    component: CursosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'resetar-senha',
    component: ResetarSenhaComponent
  }
];