import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from './usuario.model';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = environment.SERVIDOR+'/api/usuarios'; 

  constructor(private http: HttpClient) {}

   // Cadastrar novo usuário
  cadastrar(usuario: any) {
    return this.http.post(this.apiUrl, usuario);
  }

  // Listar todos os usuários
  listarTodos() {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // Atualizar authorities (papéis)
  atualizarAuthorities(id: number, authorities: string[]): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/authorities`, { authorities });
  }

  // Atualizar os dados do usuário
  atualizarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${usuario.id}`, usuario);
  }

  // Remover usuário por ID
  remover(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
