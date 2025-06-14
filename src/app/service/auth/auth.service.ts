import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/usuarios'; 

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
}
