import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoaderComponent } from './loader.component';
import { ButtonLoaderComponent } from './button-loader.component';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

@Component({
  selector: 'app-loader-demo',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ButtonLoaderComponent, SkeletonLoaderComponent],
  template: `
    <div class="demo-container">
      <h1>Sistema de Loading Melhorado</h1>
      
      <!-- Overlay Loaders -->
      <section class="demo-section">
        <h2>Overlay Loaders</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>Spinner</h3>
            <button class="btn btn-primary" (click)="showSpinner = !showSpinner">
              {{ showSpinner ? 'Ocultar' : 'Mostrar' }} Spinner
            </button>
            <app-loader [show]="showSpinner" type="spinner" size="md" text="Carregando dados..."></app-loader>
          </div>
          
          <div class="demo-item">
            <h3>Dots</h3>
            <button class="btn btn-primary" (click)="showDots = !showDots">
              {{ showDots ? 'Ocultar' : 'Mostrar' }} Dots
            </button>
            <app-loader [show]="showDots" type="dots" size="lg" text="Processando..."></app-loader>
          </div>
          
          <div class="demo-item">
            <h3>Pulse</h3>
            <button class="btn btn-primary" (click)="showPulse = !showPulse">
              {{ showPulse ? 'Ocultar' : 'Mostrar' }} Pulse
            </button>
            <app-loader [show]="showPulse" type="pulse" size="xl" text="Aguarde..."></app-loader>
          </div>
        </div>
      </section>

      <!-- Inline Loaders -->
      <section class="demo-section">
        <h2>Inline Loaders</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <p>Carregando <app-loader [show]="true" type="spinner" size="sm" [inline]="true"></app-loader> dados...</p>
          </div>
          <div class="demo-item">
            <p>Processando <app-loader [show]="true" type="dots" size="sm" [inline]="true"></app-loader> informações...</p>
          </div>
          <div class="demo-item">
            <p>Salvando <app-loader [show]="true" type="pulse" size="sm" [inline]="true"></app-loader> alterações...</p>
          </div>
        </div>
      </section>

      <!-- Button Loaders -->
      <section class="demo-section">
        <h2>Button Loaders</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>Botões Primários</h3>
            <app-button-loader 
              text="Salvar" 
              loadingText="Salvando..." 
              [loading]="buttonLoading1"
              type="primary"
              size="md"
              icon="fas fa-save"
              (clicked)="simulateButtonAction(1)">
            </app-button-loader>
            
            <app-button-loader 
              text="Excluir" 
              loadingText="Excluindo..." 
              [loading]="buttonLoading2"
              type="danger"
              size="md"
              icon="fas fa-trash"
              (clicked)="simulateButtonAction(2)">
            </app-button-loader>
          </div>
          
          <div class="demo-item">
            <h3>Botões Outline</h3>
            <app-button-loader 
              text="Cancelar" 
              loadingText="Cancelando..." 
              [loading]="buttonLoading3"
              type="outline-secondary"
              size="md"
              (clicked)="simulateButtonAction(3)">
            </app-button-loader>
            
            <app-button-loader 
              text="Confirmar" 
              loadingText="Confirmando..." 
              [loading]="buttonLoading4"
              type="outline-primary"
              size="lg"
              [fullWidth]="true"
              (clicked)="simulateButtonAction(4)">
            </app-button-loader>
          </div>
        </div>
      </section>

      <!-- Skeleton Loaders -->
      <section class="demo-section">
        <h2>Skeleton Loaders</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>Text Skeleton</h3>
            <button class="btn btn-secondary" (click)="showTextSkeleton = !showTextSkeleton">
              {{ showTextSkeleton ? 'Ocultar' : 'Mostrar' }} Text
            </button>
            <div class="skeleton-demo" *ngIf="showTextSkeleton">
              <app-skeleton-loader type="text" size="md" [lines]="4"></app-skeleton-loader>
            </div>
          </div>
          
          <div class="demo-item">
            <h3>Card Skeleton</h3>
            <button class="btn btn-secondary" (click)="showCardSkeleton = !showCardSkeleton">
              {{ showCardSkeleton ? 'Ocultar' : 'Mostrar' }} Card
            </button>
            <div class="skeleton-demo" *ngIf="showCardSkeleton">
              <app-skeleton-loader type="card" size="md"></app-skeleton-loader>
            </div>
          </div>
          
          <div class="demo-item">
            <h3>List Skeleton</h3>
            <button class="btn btn-secondary" (click)="showListSkeleton = !showListSkeleton">
              {{ showListSkeleton ? 'Ocultar' : 'Mostrar' }} List
            </button>
            <div class="skeleton-demo" *ngIf="showListSkeleton">
              <app-skeleton-loader type="list" size="md" [items]="3"></app-skeleton-loader>
            </div>
          </div>
          
          <div class="demo-item">
            <h3>Table Skeleton</h3>
            <button class="btn btn-secondary" (click)="showTableSkeleton = !showTableSkeleton">
              {{ showTableSkeleton ? 'Ocultar' : 'Mostrar' }} Table
            </button>
            <div class="skeleton-demo" *ngIf="showTableSkeleton">
              <app-skeleton-loader type="table" size="md" [columns]="4" [rows]="3"></app-skeleton-loader>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./loader-demo.component.css']
})
export class LoaderDemoComponent {
  showSpinner = false;
  showDots = false;
  showPulse = false;
  
  showTextSkeleton = false;
  showCardSkeleton = false;
  showListSkeleton = false;
  showTableSkeleton = false;
  
  buttonLoading1 = false;
  buttonLoading2 = false;
  buttonLoading3 = false;
  buttonLoading4 = false;

  simulateButtonAction(buttonNumber: number): void {
    const loadingProperty = `buttonLoading${buttonNumber}` as keyof this;
    (this as any)[loadingProperty] = true;
    
    setTimeout(() => {
      (this as any)[loadingProperty] = false;
    }, 2000);
  }
}
