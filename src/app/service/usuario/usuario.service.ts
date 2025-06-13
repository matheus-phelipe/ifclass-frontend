import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  salvar(usuario: any) {
    return this.http.post(this.apiUrl, usuario);
  }

  logar(email: any, senha: any) {
    return this.http.post(`${this.apiUrl}/login`, {email, senha});
  }
}
