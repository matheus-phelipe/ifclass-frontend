import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../export/export.service';

@Component({
  selector: 'app-export-buttons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="export-buttons">
      <div class="btn-group" role="group">
        <button 
          type="button" 
          class="btn btn-outline-primary btn-sm dropdown-toggle" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
          [disabled]="!data || data.length === 0">
          <i class="bi bi-download me-1"></i>
          Exportar
        </button>
        <ul class="dropdown-menu">
          <li>
            <button class="dropdown-item" (click)="exportExcel()">
              <i class="bi bi-file-earmark-excel text-success me-2"></i>
              Excel (.csv)
            </button>
          </li>
          <li>
            <button class="dropdown-item" (click)="exportPDF()">
              <i class="bi bi-file-earmark-pdf text-danger me-2"></i>
              PDF
            </button>
          </li>
          <li>
            <button class="dropdown-item" (click)="exportJSON()">
              <i class="bi bi-file-earmark-code text-info me-2"></i>
              JSON
            </button>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button class="dropdown-item" (click)="exportCSV()">
              <i class="bi bi-file-earmark-text text-secondary me-2"></i>
              CSV
            </button>
          </li>
        </ul>
      </div>
      
      <small class="text-muted ms-2" *ngIf="data">
        {{ data.length }} {{ data.length === 1 ? 'item' : 'itens' }}
      </small>
    </div>
  `,
  styles: [`
    .export-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
    }

    .dropdown-item:hover {
      background-color: #f8f9fa;
    }

    .dropdown-item i {
      width: 20px;
    }

    .btn-outline-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ExportButtonsComponent {
  @Input() data: any[] = [];
  @Input() filename = 'dados';
  @Input() title = 'Relatório';
  @Input() columns?: { key: string; label: string }[];
  @Input() entityType?: 'cursos' | 'turmas' | 'disciplinas' | 'aulas';

  @Output() beforeExport = new EventEmitter<string>();
  @Output() afterExport = new EventEmitter<string>();

  constructor(private exportService: ExportService) {}

  exportExcel() {
    this.beforeExport.emit('excel');
    
    if (this.entityType) {
      this.exportByEntityType('excel');
    } else {
      this.exportService.exportToExcel(this.data, this.filename, this.columns);
    }
    
    this.afterExport.emit('excel');
  }

  exportPDF() {
    this.beforeExport.emit('pdf');
    
    this.exportService.exportToPDF(this.data, this.filename, this.title, this.columns);
    
    this.afterExport.emit('pdf');
  }

  exportJSON() {
    this.beforeExport.emit('json');
    
    this.exportService.exportToJSON(this.data, this.filename);
    
    this.afterExport.emit('json');
  }

  exportCSV() {
    this.beforeExport.emit('csv');
    
    this.exportService.exportToCSV(this.data, this.filename, this.columns);
    
    this.afterExport.emit('csv');
  }

  private exportByEntityType(format: string) {
    switch (this.entityType) {
      case 'cursos':
        this.exportService.exportCursos(this.data);
        break;
      case 'turmas':
        this.exportService.exportTurmas(this.data);
        break;
      case 'disciplinas':
        this.exportService.exportDisciplinas(this.data);
        break;
      case 'aulas':
        this.exportService.exportAulas(this.data);
        break;
      default:
        if (format === 'excel') {
          this.exportService.exportToExcel(this.data, this.filename, this.columns);
        }
        break;
    }
  }
}
