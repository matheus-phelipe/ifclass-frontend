import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.SERVIDOR+'/api/usuarios'; 

  constructor(private http: HttpClient) {}

  login(email: string, senha: string ) {
    return this.http.post<{ token: string }>(`${this.API}/login`, {email, senha});
  }

  salvarToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }

  private getDecodedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Erro ao decodificar o token JWT:', e);
      return null;
    }
  }
  
   getNomeUsuario(): string | null {
    const payload = this.getDecodedToken();
    return payload ? (payload.name || payload.sub) : null;
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      return Array.isArray(payload.authorities) ? payload.authorities : [];
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  /**
   * Verifica se o usuário possui pelo menos uma das permissões da lista.
   * @param authorities - Um array de permissões a serem verificadas (ex: ['ROLE_ADMIN', 'ROLE_COORDENADOR'])
   */
  hasAnyAuthority(authorities: string[]): boolean {
    const userRoles = this.getRoles();
    // Retorna true se pelo menos uma das 'authorities' exigidas estiver presente nas 'userRoles'
    return authorities.some(auth => userRoles.includes(auth));
  }

  requestPasswordReset(email: string): Observable<any> {
    // Envia o email para o back-end
    return this.http.post(`${this.API}/request-password-reset`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    // Envia o token e a nova senha para o back-end
    return this.http.post(`${this.API}/reset-password`, { token, newPassword });
  }
}

