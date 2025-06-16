import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from '../../model/usuario/usuario.model';
import { environment } from '../../../environments/environment.development';

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
  atualizarAuthorities(id: number, authorities: string) {
    return this.http.patch(`${this.apiUrl}/${id}/authority`, { authorities });
  }

  // Atualizar os dados do usuário
  atualizarUsuario(usuario: Usuario) {
    return this.http.put(`${this.apiUrl}/${usuario.id}`, usuario);
  }

  // Remover usuário por ID
  remover(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
