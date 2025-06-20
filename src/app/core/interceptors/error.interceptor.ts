import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../service/auth/auth.service';
import { NotificationService } from '../../shared/sweetalert/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const apiError = error.error;
        // Normaliza a mensagem para minúsculo e sem acento
        let msg = '';
        if (typeof apiError === 'string') {
          msg = apiError.normalize('NFD').replace(/[ -\u036f]/g, '').toLowerCase();
        } else if (apiError && typeof apiError.message === 'string') {
          msg = apiError.message.normalize('NFD').replace(/[ -\u036f]/g, '').toLowerCase();
        }

        // Se for credenciais inválidas, só mostra o toast e interrompe o fluxo
        if (msg.includes('credencia') && msg.includes('invalid')) {
          notificationService.warn('Erro', typeof apiError === 'string' ? apiError : apiError.message);
          return throwError(() => error);
        }

        // Se não for credenciais inválidas, mostra o modal de sessão expirada e faz logout
        notificationService.warn(
          'Sessão Expirada',
          'Sua sessão expirou ou é inválida. Por favor, faça login novamente.'
        );
        authService.logout();
        return throwError(() => error);

      } else {
        // Outros erros
        const apiError = error.error;
        if (apiError && apiError.message) {
          notificationService.warn('Erro', apiError.message);
        } else if (typeof apiError === 'string') {
          notificationService.warn('Erro', apiError);
        } else {
          notificationService.warn('Erro', 'Ocorreu um erro inesperado');
        }
        return throwError(() => error);
      }
    })
  );
}; 