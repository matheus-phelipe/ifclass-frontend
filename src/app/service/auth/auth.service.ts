import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';

const ACTIVE_ROLE_KEY = 'activeRole';
const TOKEN_KEY = 'token';

const roleHierarchy: { [key: string]: number } = {
  'ROLE_ADMIN': 4,
  'ROLE_COORDENADOR': 3,
  'ROLE_PROFESSOR': 2,
  'ROLE_ALUNO': 1
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.SERVIDOR+'/api/usuarios'; 
  // BehaviorSubject para notificar componentes sobre a mudança do perfil ativo
  private activeRoleSubject = new BehaviorSubject<string | null>(this.getActiveRole());
  public activeRole$ = this.activeRoleSubject.asObservable();

  private http = inject(HttpClient);
  private router = inject(Router);

  public isAdmin$: Observable<boolean> | undefined;
  public isCoordenador$: Observable<boolean> | undefined;
  public isProfessor$: Observable<boolean> | undefined;
  
  constructor() {
    this.isAdmin$ = this.activeRoleSubject.pipe(
      map(role => this.isRoleActiveOrHigher('ROLE_ADMIN'))
    );
    this.isCoordenador$ = this.activeRoleSubject.pipe(
      map(role => this.isRoleActiveOrHigher('ROLE_COORDENADOR'))
    );
    this.isProfessor$ = this.activeRoleSubject.pipe(
      map(role => this.isRoleActiveOrHigher('ROLE_PROFESSOR'))
    );
  }

  login(email: string, senha: string ) {
    return this.http.post<{ token: string }>(`${this.API}/login`, {email, senha});
  }

  salvarToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

    logout(): void {
      localStorage.removeItem('token'); 
      sessionStorage.removeItem('activeRole'); 
      this.activeRoleSubject.next(null); 

      this.router.navigate(['/login']);
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

  /**
   * Define o perfil ativo na sessão.
   */
  setActiveRole(role: string): void {
    sessionStorage.setItem(ACTIVE_ROLE_KEY, role);
    this.activeRoleSubject.next(role);
  }

  /**
   * Obtém o perfil ativo da sessão.
   */
  getActiveRole(): string | null {
    return sessionStorage.getItem(ACTIVE_ROLE_KEY);
  }

  /**
   * Obtém todas as permissões do token JWT.
   */
  getAvailableRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Array.isArray(payload.authorities) ? payload.authorities : [];
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return [];
    }
  }

  /**
   * Verifica se o PERFIL ATIVO corresponde à permissão necessária.
   * Este método será usado pelo AuthGuard.
   */
  hasActiveRole(requiredRoles: string[]): boolean {
    const activeRole = this.getActiveRole();
    if (!activeRole) return false;
    return requiredRoles.includes(activeRole);
  }

  /**
   * Verifica se o usuário possui uma permissão em seu token (independente do perfil ativo).
   * Útil para lógicas internas de componentes.
   */
  hasRole(role: string): boolean {
    return this.getAvailableRoles().includes(role);
  }

  public isRoleActiveOrHigher(requiredRole: string): boolean {
    const activeRole = this.getActiveRole();
    if (!activeRole) return false;
    const activeLevel = roleHierarchy[activeRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return activeLevel >= requiredLevel;
  }

  getIdUsuario(): number | null {
    const payload = this.getDecodedToken();
    if (!payload) return null;
    // Tenta pegar o campo 'id' ou 'sub' (caso o backend use sub para id)
    return payload.id ? Number(payload.id) : (payload.sub ? Number(payload.sub) : null);
  }
}

