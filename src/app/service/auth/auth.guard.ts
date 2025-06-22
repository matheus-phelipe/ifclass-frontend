import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { NotificationService } from '../../shared/sweetalert/notification.service';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);



  // 1. Verifica se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Garante que um perfil ativo esteja definido. Se não estiver, força um novo login.
  const activeRole = authService.getActiveRole();
  if (!activeRole) {
    await notificationService.warn('Sessão Inválida', 'Sua sessão está inconsistente. Por favor, faça login novamente.');
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  // 3. Verifica as permissões da rota
  const requiredAuthorities = route.data['authorities'] as string[];
  if (!requiredAuthorities || requiredAuthorities.length === 0) {
    return true; // Rota pública para usuários logados
  }

  // 4. Valida o perfil ATIVO contra as permissões necessárias
  if (requiredAuthorities.includes(activeRole)) {
    return true; // Perfil ativo tem permissão. Acesso liberado!
  }

  // --- LÓGICA DE CORREÇÃO (SE O PERFIL ATIVO NÃO TEM PERMISSÃO) ---

  // Verifica se o usuário tem a permissão em seu token, mesmo que não seja o perfil ativo
  const userHasPermissionInToken = requiredAuthorities.some(role => authService.hasRole(role));

  if (userHasPermissionInToken) {
    await notificationService.warn(
      'Troca de Perfil Necessária',
      'Você tem permissão para acessar esta página, mas precisa trocar seu perfil de visão. Por favor, use o seletor de perfis.'
    );
  } else {
    await notificationService.warn(
      'Acesso Negado',
      'Você não tem permissão para acessar esta página.'
    );
  }

  // 5. REDIRECIONAMENTO CORRIGIDO PARA EVITAR O LOOP
  // Redireciona para a página "home" correspondente ao perfil ATIVO do usuário.
  if (activeRole === 'ROLE_ALUNO') {
    // Se não estiver já na página do aluno, redireciona para lá
    if (state.url !== '/aluno/mapa') {
      router.navigate(['/aluno/mapa']);
    }
  } else {
    // Se não estiver já na home principal, redireciona para lá
    if (state.url !== '/app/home') {
      router.navigate(['/app/home']);
    }
  }

  // Cancela a navegação atual que falhou
  return false;
};
