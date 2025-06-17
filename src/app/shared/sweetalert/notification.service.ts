import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  public warn(title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonColor: '#198754', // Seu verde primário
      confirmButtonText: 'Entendi'
    });
  }
  
  /**
   * Exibe um modal de confirmação padrão.
   * Retorna uma promessa que resolve para 'true' se o usuário confirmar, e 'false' caso contrário.
   * @param title O título do modal.
   * @param text O texto de descrição do modal.
   * @param confirmButtonText O texto para o botão de confirmação.
   */
  public async confirm(
    title: string,
    text: string,
    confirmButtonText: string = 'Sim, continuar'
  ): Promise<boolean> {
    
    const result: SweetAlertResult = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#198754', // Seu verde primário
      cancelButtonColor: '#6c757d',  // Cinza padrão
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    return result.isConfirmed;
  }

  /**
   * Exibe um modal de confirmação de exclusão (com botão vermelho).
   * @param title O título do modal.
   * @param text O texto de descrição do modal.
   */
  public async confirmDelete(
    title: string = 'Tem certeza?',
    text: string = 'Esta ação não pode ser desfeita.'
  ): Promise<boolean> {

    const result: SweetAlertResult = await Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',       // Vermelho perigo
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, apagar!',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    return result.isConfirmed;
  }

  /**
   * Exibe uma mensagem de sucesso simples.
   * @param title O título do modal.
   * @param text O texto de descrição do modal.
   */
  public success(title: string, text: string): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonColor: '#198754'
    });
  }
}