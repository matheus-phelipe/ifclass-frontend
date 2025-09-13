import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Aviso } from "../../model/aviso/aviso.model";

@Injectable({ providedIn: 'root' })
export class AvisosService {
  private apiUrl = 'http://localhost:8080/api/avisos'; // URL do backend Java

  constructor(private http: HttpClient) {}

  getAvisos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(this.apiUrl);
  }

  addAviso(aviso: Omit<Aviso, 'id'>): Observable<Aviso> {
    return this.http.post<Aviso>(this.apiUrl, aviso);
  }

  updateAviso(id: number, aviso: Partial<Aviso>) {
  return this.http.put<Aviso>(`${this.apiUrl}/${id}`, aviso);
}

  deleteAviso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
