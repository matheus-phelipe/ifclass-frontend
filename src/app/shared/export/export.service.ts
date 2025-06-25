import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  exportToCSV(data: any[], filename: string, columns?: { key: string; label: string }[]): void {
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    let csvContent = '';
    
    // Cabeçalhos
    if (columns) {
      csvContent += columns.map(col => `"${col.label}"`).join(',') + '\n';
    } else {
      csvContent += Object.keys(data[0]).map(key => `"${key}"`).join(',') + '\n';
    }

    // Dados
    data.forEach(row => {
      if (columns) {
        csvContent += columns.map(col => {
          const value = this.getNestedValue(row, col.key);
          return `"${this.sanitizeCSVValue(value)}"`;
        }).join(',') + '\n';
      } else {
        csvContent += Object.values(row).map(value => 
          `"${this.sanitizeCSVValue(value)}"`
        ).join(',') + '\n';
      }
    });

    this.downloadFile(csvContent, filename + '.csv', 'text/csv');
  }

  exportToJSON(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename + '.json', 'application/json');
  }

  exportToExcel(data: any[], filename: string, columns?: { key: string; label: string }[]): void {
    // Simulação de exportação Excel usando CSV com separador de ponto e vírgula
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    let csvContent = '';
    
    // Cabeçalhos
    if (columns) {
      csvContent += columns.map(col => col.label).join(';') + '\n';
    } else {
      csvContent += Object.keys(data[0]).join(';') + '\n';
    }

    // Dados
    data.forEach(row => {
      if (columns) {
        csvContent += columns.map(col => {
          const value = this.getNestedValue(row, col.key);
          return this.sanitizeExcelValue(value);
        }).join(';') + '\n';
      } else {
        csvContent += Object.values(row).map(value => 
          this.sanitizeExcelValue(value)
        ).join(';') + '\n';
      }
    });

    this.downloadFile(csvContent, filename + '.csv', 'text/csv');
  }

  exportToPDF(data: any[], filename: string, title: string, columns?: { key: string; label: string }[]): void {
    // Simulação básica de PDF usando HTML
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .export-info { text-align: center; color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="export-info">Exportado em: ${new Date().toLocaleString('pt-BR')}</div>
        <table>
          <thead>
            <tr>
    `;

    // Cabeçalhos
    if (columns) {
      columns.forEach(col => {
        htmlContent += `<th>${col.label}</th>`;
      });
    } else {
      Object.keys(data[0]).forEach(key => {
        htmlContent += `<th>${key}</th>`;
      });
    }

    htmlContent += `
            </tr>
          </thead>
          <tbody>
    `;

    // Dados
    data.forEach(row => {
      htmlContent += '<tr>';
      if (columns) {
        columns.forEach(col => {
          const value = this.getNestedValue(row, col.key);
          htmlContent += `<td>${this.sanitizeHTMLValue(value)}</td>`;
        });
      } else {
        Object.values(row).forEach(value => {
          htmlContent += `<td>${this.sanitizeHTMLValue(value)}</td>`;
        });
      }
      htmlContent += '</tr>';
    });

    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Abrir em nova janela para impressão/salvamento como PDF
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.print();
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }

  private sanitizeCSVValue(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return str.replace(/"/g, '""'); // Escape aspas duplas
  }

  private sanitizeExcelValue(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return str.replace(/;/g, ','); // Substituir ponto e vírgula por vírgula
  }

  private sanitizeHTMLValue(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Métodos específicos para cada entidade
  exportCursos(cursos: any[]): void {
    const columns = [
      { key: 'nome', label: 'Nome' },
      { key: 'codigo', label: 'Código' },
      { key: 'cargaHoraria', label: 'Carga Horária' },
      { key: 'departamento', label: 'Departamento' },
      { key: 'descricao', label: 'Descrição' }
    ];
    
    this.exportToExcel(cursos, 'cursos', columns);
  }

  exportTurmas(turmas: any[]): void {
    const columns = [
      { key: 'curso.nome', label: 'Curso' },
      { key: 'ano', label: 'Ano' },
      { key: 'semestre', label: 'Semestre' }
    ];
    
    this.exportToExcel(turmas, 'turmas', columns);
  }

  exportDisciplinas(disciplinas: any[]): void {
    const columns = [
      { key: 'nome', label: 'Nome' },
      { key: 'codigo', label: 'Código' },
      { key: 'cargaHoraria', label: 'Carga Horária' },
      { key: 'departamento', label: 'Departamento' },
      { key: 'curso.nome', label: 'Curso' }
    ];
    
    this.exportToExcel(disciplinas, 'disciplinas', columns);
  }

  exportAulas(aulas: any[]): void {
    const columns = [
      { key: 'diaSemana', label: 'Dia da Semana' },
      { key: 'hora', label: 'Horário' },
      { key: 'disciplina.nome', label: 'Disciplina' },
      { key: 'professor.nome', label: 'Professor' },
      { key: 'turma.curso.nome', label: 'Curso' },
      { key: 'sala.codigo', label: 'Sala' }
    ];
    
    this.exportToExcel(aulas, 'aulas', columns);
  }
}
