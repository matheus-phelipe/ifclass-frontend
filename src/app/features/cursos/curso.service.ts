import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Curso {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = `${environment.SERVIDOR}/api/cursos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }
} 