import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário está logado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Pega as permissões necessárias da definição da rota
  const requiredAuthorities = route.data['authorities'] as string[];

  // Se a rota não precisa de permissões (como '/home'), permite o acesso
  if (!requiredAuthorities || requiredAuthorities.length === 0) {
    return true;
  }

  // Usa o novo método para verificar se o usuário tem a permissão necessária
  if (authService.hasAnyAuthority(requiredAuthorities)) {
    return true; // Acesso permitido!
  } else {
    // Se não tiver permissão, impede o acesso e redireciona
    console.error('Acesso negado - Permissões insuficientes.');
    // Idealmente, redirecione para a home ou uma página de "acesso negado"
    router.navigate(['/home']);
    return false;
  }
};
