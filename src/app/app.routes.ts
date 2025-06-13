import { LoginComponent } from './components/usuario/login/login';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { authGuard } from './service/auth/auth.guard';
import { CadastroComponent } from './components/usuario/cadastro/cadastro';
import { Gerenciarusuarios } from './components/gerenciarusuarios/gerenciarusuarios';

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
    data: { roles: ['ROLE_ADMIN'] }
  },
];