import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cursos } from '../../model/curso/curso.model';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private readonly apiUrl = '/api/cursos'; 

  constructor(private http: HttpClient) {}

   // Cadastrar novo curso
  cadastrar(curso: any) {
    return this.http.post(this.apiUrl, curso);
  }

  // Listar todos os cursos
  listarTodos() {
    return this.http.get<Cursos[]>(this.apiUrl);
  }

  // Atualizar os dados do curso
  atualizarCurso(curso: Cursos) {
    return this.http.put(`${this.apiUrl}/${curso.id}`, curso);
  }

  // Remover curso por ID
  remover(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
