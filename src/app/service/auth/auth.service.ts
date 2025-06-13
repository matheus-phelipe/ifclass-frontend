import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/usuarios'; 

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
}
