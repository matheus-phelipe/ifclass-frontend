import { ptBR } from 'date-fns/locale';
import { formatRelative } from 'date-fns';

import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'relativeTime',
  standalone: true // Marca o pipe como independente
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: string | Date | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const now = new Date();

    try {
      // Usa a função formatRelative para criar o texto "há 5 minutos", "ontem às 15:30", etc.
      // Usamos o { locale: ptBR } para garantir que o texto venha em português.
      return formatRelative(date, now, { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data relativa:', error);
      // Retorna a data original em caso de erro
      return value.toString();
    }
  }
}
