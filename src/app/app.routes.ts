import { CadastroComponent } from './components/cadastro/cadastro';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { authGuard } from './service/auth/auth.guard';

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