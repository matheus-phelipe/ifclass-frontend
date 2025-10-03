import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../usuario/usuario.service';
import { FormsModule } from '@angular/forms';
import { BatchExcelResult } from '../../usuario/usuario.model'; 

@Component({
  selector: 'app-excel-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-usuario.html',
  styleUrls: ['./excel-usuario.css']
})
export class ExcelUsuarios {
  @Output() fechar = new EventEmitter<void>();
  @Output() importacaoConcluida = new EventEmitter<void>(); 

  file?: File;
  resultado: BatchExcelResult | null = null; 
  carregando = false;

  constructor(private usuarioService: UsuarioService) {}

  fileName: string = '';

  onFileSelected(event: any) {
    const file: File = event.target.files?.[0];
    if (!file) {
      this.file = undefined;
      this.fileName = '';
      return;
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    const isValidType = allowedTypes.includes(file.type);
    const isValidExtension = /\.(xlsx|xls)$/i.test(file.name);

    if (!isValidType && !isValidExtension) {
      alert('Formato não suportado. Selecione um arquivo .xlsx ou .xls.');
      event.target.value = null; // limpa o input
      this.file = undefined;
      this.fileName = '';
      return;
    }

    this.file = file;
    this.fileName = file.name;
    this.resultado = null;
  }


  upload() {
    if (!this.file) return;
    this.carregando = true;
    this.usuarioService.excel(this.file).subscribe({
      next: (res: BatchExcelResult) => {
        this.resultado = res;
        this.carregando = false;
        // Se pelo menos um usuário foi criado, notifica o componente pai
        if (res.createdCount > 0) {
          this.importacaoConcluida.emit();
        }
      },
      error: (err: any) => {
        this.carregando = false;
        this.resultado = err.error; // Exibe o erro retornado pela API no modal
        alert('Erro ao importar: ' + (err.error?.errors?.[0]?.message || err.message || 'erro desconhecido'));
      }
    });
  }
}