import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from '../../model/usuario/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  cadastrar(usuario: any) {
    return this.http.post(this.apiUrl, usuario);
  }
  listarTodos() {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  atualizarAuthorities(id: number, authorities: string) {
    return this.http.patch(`${this.apiUrl}/${id}/authority`, { authorities });
  }
}
