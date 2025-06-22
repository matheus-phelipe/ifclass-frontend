import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'diaSemana', standalone: true })
export class DiaSemanaPipe implements PipeTransform {
  private dias = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  transform(value: string | number | Date): string {
    let dia: number;
    if (typeof value === 'number') {
      dia = value;
    } else if (typeof value === 'string') {
      const data = new Date(value);
      dia = data.getDay();
    } else if (value instanceof Date) {
      dia = value.getDay();
    } else {
      return '';
    }
    return this.dias[dia] || '';
  }
} 