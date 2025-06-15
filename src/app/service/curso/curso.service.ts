import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cursos } from '../../model/curso/curso.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private readonly apiUrl = '/api/cursos'; 

  constructor(private http: HttpClient) {}

   // Cadastrar novo curso
  cadastrar(nome: string): Observable<Cursos> {
      const novoCurso = { nome };
      return this.http.post<Cursos>(this.apiUrl, novoCurso);
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
