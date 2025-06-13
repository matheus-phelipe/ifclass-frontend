import { LoginComponent } from './components/usuario/login/login';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { authGuard } from './service/auth/auth.guard';
import { CadastroComponent } from './components/usuario/cadastro/cadastro';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  {
    path: 'home',
    component: Home,
    canActivate: [authGuard] // protege a rota
  },
];