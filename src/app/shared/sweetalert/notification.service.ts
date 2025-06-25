import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertResult } from 'sweetalert2';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showProgressBar?: boolean;
  closeButton?: boolean;
  preventDuplicates?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) {
    // Configurações globais do toastr
    this.toastr.toastrConfig.timeOut = 4000;
    this.toastr.toastrConfig.positionClass = 'toast-top-right';
    this.toastr.toastrConfig.preventDuplicates = true;
    this.toastr.toastrConfig.progressBar = true;
    this.toastr.toastrConfig.closeButton = true;
    this.toastr.toastrConfig.newestOnTop = true;
  }

  // ===== TOAST NOTIFICATIONS =====

  /**
   * Exibe um toast de sucesso
   */
  public showSuccess(message: string, title: string = 'Sucesso', options?: NotificationOptions): void {
    this.toastr.success(message, title, this.buildToastrOptions(options));
  }

  /**
   * Exibe um toast de erro
   */
  public showError(message: string, title: string = 'Erro', options?: NotificationOptions): void {
    this.toastr.error(message, title, this.buildToastrOptions(options));
  }

  /**
   * Exibe um toast de aviso
   */
  public showWarning(message: string, title: string = 'Atenção', options?: NotificationOptions): void {
    this.toastr.warning(message, title, this.buildToastrOptions(options));
  }

  /**
   * Exibe um toast de informação
   */
  public showInfo(message: string, title: string = 'Informação', options?: NotificationOptions): void {
    this.toastr.info(message, title, this.buildToastrOptions(options));
  }

  // ===== MODAL NOTIFICATIONS (SweetAlert2) =====

  /**
   * Exibe um modal de aviso (substitui alert())
   */
  public warn(title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonColor: '#198754',
      confirmButtonText: 'Entendi',
      customClass: {
        popup: 'swal-modern',
        title: 'swal-title',
        htmlContainer: 'swal-content'
      }
    });
  }

  /**
   * Exibe uma mensagem de sucesso em modal
   */
  public success(title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonColor: '#198754',
      confirmButtonText: 'Ótimo!',
      customClass: {
        popup: 'swal-modern',
        title: 'swal-title',
        htmlContainer: 'swal-content'
      }
    });
  }

  /**
   * Exibe uma mensagem de erro em modal
   */
  public error(title: string, text: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Entendi',
      customClass: {
        popup: 'swal-modern',
        title: 'swal-title',
        htmlContainer: 'swal-content'
      }
    });
  }

  /**
   * Exibe um modal de confirmação padrão (substitui confirm())
   */
  public async confirm(
    title: string,
    text: string,
    confirmButtonText: string = 'Sim, continuar'
  ): Promise<boolean> {

    const result: SweetAlertResult = await Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal-modern',
        title: 'swal-title',
        htmlContainer: 'swal-content'
      }
    });

    return result.isConfirmed;
  }

  /**
   * Exibe um modal de confirmação de exclusão
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
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, apagar!',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal-modern swal-danger',
        title: 'swal-title',
        htmlContainer: 'swal-content'
      }
    });

    return result.isConfirmed;
  }

  /**
   * Exibe um modal de confirmação para ações críticas do sistema
   */
  public async confirmCritical(
    title: string,
    text: string,
    confirmButtonText: string = 'Sim, executar'
  ): Promise<boolean> {

    const result: SweetAlertResult = await Swal.fire({
      title: title,
      html: `<div class="text-warning mb-3"><i class="bi bi-exclamation-triangle-fill fs-1"></i></div><p>${text}</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fd7e14',
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal-modern swal-critical',
        title: 'swal-title',
        htmlContainer: 'swal-content'
      }
    });

    return result.isConfirmed;
  }

  // ===== UTILITY METHODS =====

  private buildToastrOptions(options?: NotificationOptions): any {
    if (!options) return {};

    return {
      timeOut: options.duration || 4000,
      positionClass: this.getToastrPosition(options.position),
      progressBar: options.showProgressBar !== false,
      closeButton: options.closeButton !== false,
      preventDuplicates: options.preventDuplicates !== false
    };
  }

  private getToastrPosition(position?: string): string {
    const positionMap: { [key: string]: string } = {
      'top-right': 'toast-top-right',
      'top-left': 'toast-top-left',
      'bottom-right': 'toast-bottom-right',
      'bottom-left': 'toast-bottom-left',
      'top-center': 'toast-top-center',
      'bottom-center': 'toast-bottom-center'
    };

    return positionMap[position || 'top-right'] || 'toast-top-right';
  }
}