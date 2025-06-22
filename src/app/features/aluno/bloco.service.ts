import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bloco } from './bloco.model';
import { Sala } from './sala.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class BlocoService {
  private apiUrl = environment.SERVIDOR+'/api/blocos';

  constructor(private http: HttpClient) { }

  getBlocos(): Observable<Bloco[]> {
    return this.http.get<Bloco[]>(this.apiUrl);
  }

  createBloco(nome: string): Observable<Bloco> {
    const novoBloco = { nome, salas: [] };
    return this.http.post<Bloco>(this.apiUrl, novoBloco);
  }
  
  deleteBloco(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Envia o objeto sala sem o 'id' para ser criado
  addSala(blocoId: number, sala: Partial<Sala>): Observable<Bloco> {
    return this.http.post<Bloco>(`${this.apiUrl}/${blocoId}/salas`, sala);
  }

  updateSala(blocoId: number, salaId: number, sala: Partial<Sala>): Observable<Sala> {
    return this.http.put<Sala>(`${this.apiUrl}/${blocoId}/salas/${salaId}`, sala);
  }
  
  // O endpoint de delete agora usa o ID da sala na URL
  deleteSala(blocoId: number, salaId: number): Observable<Bloco> {
    return this.http.delete<Bloco>(`${this.apiUrl}/${blocoId}/salas/${salaId}`);
  }
}