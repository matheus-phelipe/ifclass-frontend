// src/app/service/curso/curso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Curso, NovoCursoDTO } from '../../model/cursos/curso.model';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  // E se '/api/cursos' é o endpoint correto para Cursos no seu backend Spring Boot.
  private apiUrl = `${environment.SERVIDOR}/api/cursos`;

  constructor(private http: HttpClient) { }

  /**
   * Obtém todos os cursos do backend.
   * @returns Um Observable com um array de Curso.
   */
  getTodosCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  /**
   * Cria um novo curso no backend.
   * @param novoCurso O objeto NovoCursoDTO contendo os dados do novo curso (nome, codigo, cargaHoraria, departamento, descricao).
   * @returns Um Observable com o Curso criado.
   */
  criarCurso(novoCurso: NovoCursoDTO): Observable<Curso> {
    return this.http.post<Curso>(this.apiUrl, novoCurso);
  }

  /**
   * Atualiza um curso existente no backend.
   * @param id O ID do curso a ser atualizado.
   * @param cursoAtualizado O objeto NovoCursoDTO contendo os dados atualizados do curso.
   * @returns Um Observable com o Curso atualizado.
   */
  atualizarCurso(id: number, cursoAtualizado: NovoCursoDTO): Observable<Curso> {
    return this.http.put<Curso>(`${this.apiUrl}/${id}`, cursoAtualizado);
  }

  /**
   * Deleta um curso do backend.
   * @param id O ID do curso a ser deletado.
   * @returns Um Observable vazio (void) após a exclusão.
   */
  deletarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
