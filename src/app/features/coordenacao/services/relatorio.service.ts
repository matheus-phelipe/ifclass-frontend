import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RelatorioRequest {
  tipo: string;
  dataInicio?: string;
  dataFim?: string;
  formato?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = `${environment.SERVIDOR}/api/relatorios`;

  constructor(private http: HttpClient) { }

  gerarRelatorio(request: RelatorioRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/gerar`, request, { responseType: 'text' });
  }

  exportarPDF(request: RelatorioRequest): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/exportar/pdf`, request, {
      headers: headers,
      responseType: 'blob'
    });
  }

  exportarExcel(request: RelatorioRequest): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/exportar/excel`, request, {
      headers: headers,
      responseType: 'blob'
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPDF(request: RelatorioRequest): void {
    this.exportarPDF(request).subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `relatorio_${request.tipo}_${timestamp}.pdf`;
        this.downloadFile(blob, filename);
      },
      error: (error) => {
        console.error('Erro ao baixar PDF:', error);
        alert('Erro ao gerar PDF. Tente novamente.');
      }
    });
  }

  downloadExcel(request: RelatorioRequest): void {
    this.exportarExcel(request).subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `relatorio_${request.tipo}_${timestamp}.xlsx`;
        this.downloadFile(blob, filename);
      },
      error: (error) => {
        console.error('Erro ao baixar Excel:', error);
        alert('Erro ao gerar Excel. Tente novamente.');
      }
    });
  }
}
