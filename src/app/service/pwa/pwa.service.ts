import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any;
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  private installPromptSubject = new BehaviorSubject<boolean>(false);

  public isOnline$ = this.isOnlineSubject.asObservable();
  public canInstall$ = this.installPromptSubject.asObservable();

  constructor(
    private notificationService: NotificationService
  ) {
    this.initializeNetworkStatus();
    this.initializeInstallPrompt();
  }

  /**
   * Inicializa monitoramento do status da rede
   */
  private initializeNetworkStatus(): void {
    // Monitora mudanças no status da rede
    fromEvent(window, 'online').subscribe(() => {
      this.isOnlineSubject.next(true);
      this.notificationService.success('Conexão Restaurada', 'Você está online novamente!');
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.isOnlineSubject.next(false);
      this.notificationService.warn('Sem Conexão', 'Você está offline. Algumas funcionalidades podem estar limitadas.');
    });
  }

  /**
   * Inicializa prompt de instalação PWA
   */
  private initializeInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.installPromptSubject.next(true);
    });

    window.addEventListener('appinstalled', () => {
      this.installPromptSubject.next(false);
      this.notificationService.success('App Instalado', 'IFClass foi instalado com sucesso!');
    });
  }

  /**
   * Atualiza a aplicação (versão simplificada)
   */
  public updateApp(): void {
    window.location.reload();
  }

  /**
   * Instala o PWA
   */
  public async installPwa(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.installPromptSubject.next(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      return false;
    }
  }

  /**
   * Verifica se está rodando como PWA
   */
  public isPwaMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Verifica se o dispositivo é móvel
   */
  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Verifica se o dispositivo é iOS
   */
  public isIos(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Solicita permissão para notificações
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Envia notificação local
   */
  public sendLocalNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        ...options
      });
    }
  }

  /**
   * Registra para sincronização em background (versão simplificada)
   */
  public async registerBackgroundSync(tag: string): Promise<void> {
    // Implementação simplificada
  }

  /**
   * Salva dados para sincronização offline
   */
  public saveOfflineData(data: any): void {
    // Implementar salvamento no IndexedDB
    const offlineData = JSON.parse(localStorage.getItem('ifclass_offline_data') || '[]');
    offlineData.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...data
    });
    localStorage.setItem('ifclass_offline_data', JSON.stringify(offlineData));
  }

  /**
   * Obtém dados offline salvos
   */
  public getOfflineData(): any[] {
    return JSON.parse(localStorage.getItem('ifclass_offline_data') || '[]');
  }

  /**
   * Remove dados offline após sincronização
   */
  public clearOfflineData(): void {
    localStorage.removeItem('ifclass_offline_data');
  }

  /**
   * Verifica capacidades do dispositivo
   */
  public getDeviceCapabilities(): any {
    return {
      isOnline: navigator.onLine,
      isMobile: this.isMobile(),
      isIos: this.isIos(),
      isPwa: this.isPwaMode(),
      hasNotifications: 'Notification' in window,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      hasShare: 'share' in navigator,
      hasVibration: 'vibrate' in navigator,
      hasGeolocation: 'geolocation' in navigator,
      hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    };
  }

  /**
   * Compartilha conteúdo usando Web Share API
   */
  public async shareContent(data: ShareData): Promise<boolean> {
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Vibra o dispositivo (se suportado)
   */
  public vibrate(pattern: number | number[]): boolean {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
      return true;
    }
    return false;
  }

  /**
   * Obtém informações de conectividade
   */
  public getConnectionInfo(): any {
    const connection = (navigator as any).connection;
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }
}
