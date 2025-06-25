import { Injectable } from '@angular/core';

export interface NotificationAction {
  text: string;
  handler: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  /**
   * Mostra notificação de sucesso
   */
  success(title: string, message?: string, actions?: NotificationAction[]): void {
    this.showNotification('success', title, message, actions);
  }

  /**
   * Mostra notificação de erro
   */
  error(title: string, message?: string, actions?: NotificationAction[]): void {
    this.showNotification('error', title, message, actions);
  }

  /**
   * Mostra notificação de aviso
   */
  warn(title: string, message?: string, actions?: NotificationAction[]): void {
    this.showNotification('warning', title, message, actions);
  }

  /**
   * Mostra notificação de informação
   */
  info(title: string, message?: string, actions?: NotificationAction[]): void {
    this.showNotification('info', title, message, actions);
  }

  /**
   * Método privado para mostrar notificações
   */
  private showNotification(type: string, title: string, message?: string, actions?: NotificationAction[]): void {
    // Por enquanto, vamos usar alert simples
    // Depois podemos integrar com uma biblioteca de toast
    const fullMessage = message ? `${title}\n${message}` : title;
    
    if (actions && actions.length > 0) {
      const confirmed = confirm(fullMessage + '\n\nDeseja continuar?');
      if (confirmed && actions[0]) {
        actions[0].handler();
      } else if (!confirmed && actions[1]) {
        actions[1].handler();
      }
    } else {
      alert(fullMessage);
    }
  }

  /**
   * Mostra toast simples
   */
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    // Implementação simples de toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getToastColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      word-wrap: break-word;
      animation: slideInRight 0.3s ease-out;
    `;

    // Adiciona animação CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Remove o toast após 3 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Obtém cor do toast baseada no tipo
   */
  private getToastColor(type: string): string {
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  /**
   * Mostra confirmação
   */
  confirm(title: string, message?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const fullMessage = message ? `${title}\n${message}` : title;
      const result = confirm(fullMessage);
      resolve(result);
    });
  }

  /**
   * Mostra prompt
   */
  prompt(title: string, defaultValue?: string): Promise<string | null> {
    return new Promise((resolve) => {
      const result = prompt(title, defaultValue);
      resolve(result);
    });
  }
}
