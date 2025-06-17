// src/app/service/auth/error.interceptor.ts

import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { NotificationService } from '../../shared/sweetalert/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Verifica se o erro é uma resposta 401 Unauthorized
      if (error.status === 401) {
        // Exibe uma notificação amigável ao usuário
        notificationService.warn(
            'Sessão Expirada',
            'Sua sessão expirou ou é inválida. Por favor, faça login novamente.'
        );
        // Chama o método de logout, que irá limpar o token e redirecionar
        authService.logout();
      }

      // Propaga o erro para que outros tratadores de erro possam lidar com ele
      return throwError(() => error);
    })
  );
};