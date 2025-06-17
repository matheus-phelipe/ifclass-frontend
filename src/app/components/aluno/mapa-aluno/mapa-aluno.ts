// ARQUIVO: src/app/components/aluno/mapa-aluno/mapa-aluno.component.ts

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bloco } from '../../../model/bloco/bloco.model';
import { Sala } from '../../../model/bloco/sala.model';
import { BlocoService } from '../../../service/bloco/bloco.service';
import { NgxPanZoomModule } from 'ngx-panzoom'; 
import { AuthService } from '../../../service/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { ProfileSwitcherComponent } from '../../../shared/profile-switcher/profile-switcher';
import { Router } from '@angular/router';

export interface PanZoomConfig {
  zoomFactor?: number;
  minScale?: number;
  maxScale?: number;
  panOnClick?: boolean;
  zoomOnDoubleClick?: boolean;
  zoomOnMouseWheel?: boolean;
  invertMouseWheel?: boolean;
  freeMouseWheel?: boolean;
  initialZoomToFit?: boolean;
  initialZoom?: number;
  initialPanX?: number;
  initialPanY?: number;
  zoomOnPinch?: boolean; // Adicionado para melhor suporte a touch
  keepInBounds?: boolean;
  limitToPan?: boolean;
  limitPan?: boolean;
  fitToScreen?: boolean; // As vezes usado no lugar de initialZoomToFit
  eventHandlers?: {
    singleClick?: (event: MouseEvent) => void;
    doubleClick?: (event: MouseEvent) => void;
    mouseWheel?: (event: WheelEvent) => void;
    mouseDown?: (event: MouseEvent) => void;
    mouseMove?: (event: MouseEvent) => void;
    mouseUp?: (event: MouseEvent) => void;
  };
}

@Component({
  selector: 'app-mapa-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPanZoomModule, ProfileSwitcherComponent],
  templateUrl: './mapa-aluno.html',
  styleUrls: ['./mapa-aluno.css'], // Crie um CSS se precisar
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapaAlunoComponent implements OnInit {

  public blocos: Bloco[] = [];
  isLoading = true;
  error: string | null = null;
  public activeBlocoId: number | null = null;
  public editingSala: Sala | null = null;

  // --- Propriedades para o Drag and Drop ---
  public isDragging = false;
  public draggingSala: Sala | null = null;
  private dragOffset = { x: 0, y: 0 };
  private svgElement: SVGSVGElement | null = null;
  private hasMoved = false; // Flag para diferenciar clique de arrastar
  private dragStartPoint = { x: 0, y: 0 }; 
  private readonly DRAG_THRESHOLD = 5; // Distância em pixels para considerar um "arrastar" em vez de um "clique"

  // --- CONFIGURAÇÃO NGX-PANZOOM (ATUALIZADA) ---
  public panZoomConfig: PanZoomConfig = {
    zoomFactor: 0.15,      // Mais suave
    minScale: 0.2,         // Escala mínima: impede zoom out excessivo
    maxScale: 5,           // Escala máxima
    panOnClick: true,      // Permite arrastar o mapa clicando e arrastando
    zoomOnDoubleClick: true, // Zoom ao dar dois cliques
    zoomOnMouseWheel: true,  // Zoom com a roda do mouse
    invertMouseWheel: false,
    freeMouseWheel: false,
    initialZoomToFit: true, // <-- Prioriza o ajuste inicial para a tela
    // initialZoom: 1,        // Removido/comentado para evitar conflito com initialZoomToFit, mas pode ser um fallback
    zoomOnPinch: true,     // <-- MUITO IMPORTANTE PARA TOUCH
    keepInBounds: true,    // Tenta manter o conteúdo dentro dos limites visíveis
  };

  novoBlocoNome = '';
  formSala: {
    codigo: string;
    capacidade: number | null;
    posX: number | undefined;
    posY: number | undefined;
    largura: number | undefined;
    altura: number | undefined;
    cor: string;
  } = {
    codigo: '',
    capacidade: null,
    posX: 50,
    posY: 50,
    largura: 150,
    altura: 100,
    cor: '#FFFFFF'
  };
  blocoSelecionadoId: number | null = null;

  constructor(
    private blocoService: BlocoService,
    public authService: AuthService,
    private el: ElementRef,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.carregarBlocos();
  }

  // --- Lógica de Drag and Drop (Apenas para Admin) ---

   // 1. Métodos que são chamados pelo Template (HTML)
  
  onMouseDown(event: MouseEvent, sala: Sala): void {
    if (!this.authService.isRoleActiveOrHigher('ROLE_ADMIN')) return;
    this.handleDragStart(event.clientX, event.clientY, sala, event);
  }

  onTouchStart(event: TouchEvent, sala: Sala): void {
    if (!this.authService.isRoleActiveOrHigher('ROLE_ADMIN')) return;
    // Usamos o primeiro ponto de toque
    const touch = event.touches[0];
    this.handleDragStart(touch.clientX, touch.clientY, sala, event);
  }

  // 2. HostListeners para movimento e finalização (escutam na janela toda)

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.handleDragMove(event.clientX, event.clientY);
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    const touch = event.touches[0];
    this.handleDragMove(touch.clientX, touch.clientY);
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.handleDragEnd(event.clientX, event.clientY);
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging) return;
    // Para touchend, usamos changedTouches pois `touches` estará vazio
    const touch = event.changedTouches[0];
    this.handleDragEnd(touch.clientX, touch.clientY);
  }

  // 3. Funções de Lógica Central (o coração da solução)

  private handleDragStart(clientX: number, clientY: number, sala: Sala, originalEvent: MouseEvent | TouchEvent): void {
    // Previne o comportamento padrão (como o scroll no touch) e impede que o pan-zoom capture o evento.
    // Isso é CRUCIAL para o zoom funcionar corretamente no mobile.
    originalEvent.stopPropagation();
    originalEvent.preventDefault();

    this.isDragging = true;
    this.draggingSala = sala;
    this.dragStartPoint = { x: clientX, y: clientY }; // Salva o ponto inicial

    this.svgElement = (this.el.nativeElement as HTMLElement).querySelector('.floorplan-svg');
    const point = this.getSVGPoint(clientX, clientY);

    this.dragOffset = {
      x: point.x - (sala.posX ?? 0),
      y: point.y - (sala.posY ?? 0)
    };
  }
  
  private handleDragMove(clientX: number, clientY: number): void {
    if (!this.draggingSala) return;

    const point = this.getSVGPoint(clientX, clientY);
    let newX = Math.round(point.x - this.dragOffset.x);
    let newY = Math.round(point.y - this.dragOffset.y);

    const viewBox = { width: 1600, height: 900 };
    const salaWidth = this.draggingSala.largura ?? 150;
    const salaHeight = this.draggingSala.altura ?? 100;

    newX = Math.max(0, Math.min(newX, viewBox.width - salaWidth));
    newY = Math.max(0, Math.min(newY, viewBox.height - salaHeight));
    
    this.draggingSala.posX = newX;
    this.draggingSala.posY = newY;

    if (this.editingSala && this.editingSala.id === this.draggingSala.id) {
        this.formSala.posX = newX;
        this.formSala.posY = newY;
    }
  }

  private handleDragEnd(clientX: number, clientY: number): void {
    if (!this.draggingSala) return;

    // Calcula a distância total do arrasto
    const deltaX = clientX - this.dragStartPoint.x;
    const deltaY = clientY - this.dragStartPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < this.DRAG_THRESHOLD) {
      // Se a distância for muito pequena, consideramos um CLIQUE
      this.selectSala(this.draggingSala);
    } else {
      // Se a distância for maior, consideramos um ARRASTAR
      this.updateSalaPosition(this.draggingSala);
    }

    this.isDragging = false;
    this.draggingSala = null;
    this.svgElement = null;
  }

  private getSVGPoint(clientX: number, clientY: number): DOMPoint {
    if (!this.svgElement) return new DOMPoint();
    const svgPoint = this.svgElement.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = clientY;
    const ctm = this.svgElement.getScreenCTM();
    if (ctm) {
      return svgPoint.matrixTransform(ctm.inverse());
    }
    return svgPoint;
  }

  private updateSalaPosition(sala: Sala): void {
    const bloco = this.blocos.find(b => b.salas.some(s => s.id === sala.id));
    if (!bloco || !bloco.id || !sala.id) return;

    this.blocoService.updateSala(bloco.id, sala.id, sala).subscribe({
        error: () => {
            this.error = 'Falha ao salvar a nova posição da sala.';
            this.carregarBlocos();
        }
    });
  }

  // --- Fim da Lógica de Drag and Drop ---

  selectSala(sala: Sala): void {
    // A seleção para edição só é permitida se for admin.
    if (!this.authService.isRoleActiveOrHigher('ROLE_ADMIN')) return;
    this.editingSala = sala;
    this.formSala = {
      codigo: sala.codigo,
      capacidade: sala.capacidade,
      posX: sala.posX ?? 50,
      posY: sala.posY ?? 50,
      largura: sala.largura ?? 150,
      altura: sala.altura ?? 100,
      cor: sala.cor || '#FFFFFF'
    };

    const parentBloco = this.blocos.find(b => b.salas.some(s => s.id === sala.id));
    if (parentBloco) {
      this.blocoSelecionadoId = parentBloco.id;
    }
  }

  toggleBloco(blocoId: number): void {
    this.activeBlocoId = this.activeBlocoId === blocoId ? null : blocoId;
    this.cancelarEdicao();
  }

  cancelarEdicao(): void {
    this.editingSala = null;
    this.formSala = {
      codigo: '',
      capacidade: null,
      posX: 50,
      posY: 50,
      largura: 150,
      altura: 100,
      cor: '#FFFFFF'
    };
  }

  carregarBlocos(): void {
    this.isLoading = true;
    this.blocoService.getBlocos().subscribe({
      next: (data) => {
        this.blocos = data.sort((a, b) => (a.nome.localeCompare(b.nome))); // Ordena por nome para consistência
        
        // Seleciona o primeiro bloco da lista por padrão
        if (!this.activeBlocoId && this.blocos.length > 0) {
          this.activeBlocoId = this.blocos[0].id; 
        }
        
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Falha ao carregar os dados do campus.';
        this.isLoading = false;
      }
    });
  }

  handleCreateBloco(): void {
    if (!this.novoBlocoNome.trim()) return;
    this.blocoService.createBloco(this.novoBlocoNome).subscribe({
      next: (novoBloco) => {
        this.novoBlocoNome = '';
        this.carregarBlocos();
        this.activeBlocoId = novoBloco.id;
      },
      error: () => { this.error = 'Falha ao criar bloco.'; }
    });
  }

  resetPosition(): void {
    if (!this.editingSala) return;
    this.formSala.posX = 10;
    this.formSala.posY = 10;
    this.handleSubmitSala();
  }

  handleSubmitSala(): void {
    if (!this.formSala.codigo?.trim() || this.formSala.capacidade === null || this.blocoSelecionadoId === null) {
      this.error = "Por favor, preencha todos os campos da sala.";
      return;
    }

    const salaData: Partial<Sala> = {
      codigo: this.formSala.codigo,
      capacidade: this.formSala.capacidade,
      posX: this.formSala.posX,
      posY: this.formSala.posY,
      largura: this.formSala.largura,
      altura: this.formSala.altura,
      cor: this.formSala.cor 
    };

    if (this.editingSala) {
      this.blocoService.updateSala(this.blocoSelecionadoId, this.editingSala.id, salaData).subscribe({
        next: () => { this.cancelarEdicao(); this.carregarBlocos(); },
        error: () => { this.error = 'Falha ao atualizar a sala.'; }
      });
    } else {
      this.blocoService.addSala(this.blocoSelecionadoId, salaData).subscribe({
        next: () => { this.cancelarEdicao(); this.carregarBlocos(); },
        error: () => { this.error = 'Falha ao criar a sala.'; }
      });
    }
  }

  handleDeleteBloco(id: number): void {
    if (confirm('Tem certeza que deseja apagar este bloco e todas as suas salas?')) {
      this.blocoService.deleteBloco(id).subscribe({
        next: () => {
            if(this.blocoSelecionadoId === id) this.blocoSelecionadoId = null;
            if(this.activeBlocoId === id) this.activeBlocoId = null;
            this.carregarBlocos();
        },
        error: () => { this.error = 'Falha ao deletar bloco.';}
      });
    }
  }

  handleDeleteSala(blocoId: number, salaId: number): void {
    if (confirm('Tem certeza que deseja apagar esta sala?')) {
      this.blocoService.deleteSala(blocoId, salaId).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarBlocos();
        },
        error: () => { this.error = 'Falha ao deletar a sala.' }
      });
    }
  }

  public getActiveBlocoName(): string {
    if (!this.activeBlocoId) {
      return '';
    }
    const activeBloco = this.blocos.find(b => b.id === this.activeBlocoId);
    return activeBloco ? activeBloco.nome : '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}