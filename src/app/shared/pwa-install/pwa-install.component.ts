import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PwaService } from '../../service/pwa/pwa.service';
import { NotificationService } from '../../service/notification/notification.service';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Banner de Instalação PWA -->
    <div
      *ngIf="showInstallBanner && !isPwaMode"
      class="pwa-install-banner">
      
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-auto">
            <div class="pwa-icon">
              <i class="bi bi-phone"></i>
            </div>
          </div>
          
          <div class="col">
            <div class="pwa-content">
              <h6 class="mb-1">Instalar IFClass</h6>
              <p class="mb-0 text-muted small">
                Adicione à tela inicial para acesso rápido e funcionalidades offline
              </p>
            </div>
          </div>
          
          <div class="col-auto">
            <div class="pwa-actions">
              <button 
                class="btn btn-success btn-sm me-2"
                (click)="installApp()">
                <i class="bi bi-download me-1"></i>
                Instalar
              </button>
              
              <button 
                class="btn btn-outline-secondary btn-sm"
                (click)="dismissBanner()">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status de Conectividade -->
    <div
      *ngIf="!isOnline"
      class="connectivity-banner offline">
      
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-auto">
            <i class="bi bi-wifi-off text-warning"></i>
          </div>
          
          <div class="col">
            <span class="fw-medium">Modo Offline</span>
            <small class="d-block text-muted">
              Algumas funcionalidades podem estar limitadas
            </small>
          </div>
          
          <div class="col-auto">
            <div class="spinner-border spinner-border-sm text-warning" role="status">
              <span class="visually-hidden">Reconectando...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instruções iOS -->
    <div 
      *ngIf="showIosInstructions" 
      class="ios-instructions-modal"
      (click)="closeIosInstructions()">
      
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-apple me-2"></i>
            Instalar no iOS
          </h5>
          <button 
            type="button" 
            class="btn-close"
            (click)="closeIosInstructions()">
          </button>
        </div>
        
        <div class="modal-body">
          <div class="ios-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <p>Toque no botão <strong>Compartilhar</strong></p>
                <div class="ios-icon">
                  <i class="bi bi-share"></i>
                </div>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <p>Selecione <strong>"Adicionar à Tela de Início"</strong></p>
                <div class="ios-icon">
                  <i class="bi bi-plus-square"></i>
                </div>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <p>Toque em <strong>"Adicionar"</strong> para confirmar</p>
                <div class="ios-icon">
                  <i class="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-success"
            (click)="closeIosInstructions()">
            Entendi
          </button>
        </div>
      </div>
    </div>

    <!-- Botão Flutuante de Instalação (Mobile) -->
    <button
      *ngIf="showFloatingButton && !isPwaMode"
      class="pwa-floating-btn"
      (click)="showInstallOptions()">
      <i class="bi bi-download"></i>
    </button>
  `,
  styleUrls: ['./pwa-install.component.css']
})
export class PwaInstallComponent implements OnInit, OnDestroy {
  showInstallBanner = false;
  showFloatingButton = false;
  showIosInstructions = false;
  isOnline = true;
  isPwaMode = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private pwaService: PwaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeComponent(): void {
    this.isPwaMode = this.pwaService.isPwaMode();

    // Mostra banner apenas se não for PWA e não foi dispensado
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    if (!this.isPwaMode && !dismissed) {
      setTimeout(() => {
        this.showInstallBanner = true;
      }, 2000); // Mostra após 2 segundos
    }

    // Mostra botão flutuante em dispositivos móveis
    if (this.pwaService.isMobile() && !this.isPwaMode) {
      this.showFloatingButton = true;
    }
  }

  private setupSubscriptions(): void {
    // Monitora status de conectividade
    this.subscriptions.push(
      this.pwaService.isOnline$.subscribe(online => {
        this.isOnline = online;
      })
    );

    // Monitora disponibilidade de instalação
    this.subscriptions.push(
      this.pwaService.canInstall$.subscribe(canInstall => {
        if (canInstall && !this.isPwaMode) {
          this.showInstallBanner = true;
        }
      })
    );
  }

  async installApp(): Promise<void> {
    if (this.pwaService.isIos()) {
      this.showIosInstructions = true;
      return;
    }

    const installed = await this.pwaService.installPwa();
    
    if (installed) {
      this.showInstallBanner = false;
      this.showFloatingButton = false;
      this.notificationService.success(
        'App Instalado!', 
        'IFClass foi adicionado à sua tela inicial'
      );
    } else {
      this.notificationService.warn(
        'Instalação Cancelada', 
        'Você pode instalar o app a qualquer momento'
      );
    }
  }

  dismissBanner(): void {
    this.showInstallBanner = false;
    localStorage.setItem('pwa_banner_dismissed', 'true');
  }

  showInstallOptions(): void {
    if (this.pwaService.isIos()) {
      this.showIosInstructions = true;
    } else {
      this.installApp();
    }
  }

  closeIosInstructions(): void {
    this.showIosInstructions = false;
  }

  // Métodos para compartilhamento
  async shareApp(): Promise<void> {
    const shareData = {
      title: 'IFClass - Sistema de Gestão Acadêmica',
      text: 'Conheça o IFClass, sistema completo para gestão de campus e aulas',
      url: window.location.origin
    };

    const shared = await this.pwaService.shareContent(shareData);
    
    if (!shared) {
      // Fallback para dispositivos sem Web Share API
      this.copyToClipboard(window.location.origin);
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.notificationService.success(
        'Link Copiado!', 
        'O link foi copiado para a área de transferência'
      );
    }).catch(() => {
      this.notificationService.error(
        'Erro', 
        'Não foi possível copiar o link'
      );
    });
  }

  // Métodos para notificações
  async enableNotifications(): Promise<void> {
    const granted = await this.pwaService.requestNotificationPermission();
    
    if (granted) {
      this.notificationService.success(
        'Notificações Ativadas!', 
        'Você receberá notificações importantes do IFClass'
      );
    } else {
      this.notificationService.warn(
        'Notificações Negadas', 
        'Você pode ativar nas configurações do navegador'
      );
    }
  }
}
