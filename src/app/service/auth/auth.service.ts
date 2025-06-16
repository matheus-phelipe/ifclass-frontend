import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  // Pega o nome do usuário de dentro do token JWT.
  // A lógica é a mesma de getRoles(), mas pegamos um campo diferente.
  getNomeUsuario(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      // O nome do usuário geralmente está no campo 'name' ou 'sub' (subject).
      // Verifique qual o seu backend usa. Vamos usar 'name' como padrão.
      return payload.name || null;
    } catch (e) {
      console.error('Erro ao decodificar token para obter nome:', e);
      return null;
    }
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

