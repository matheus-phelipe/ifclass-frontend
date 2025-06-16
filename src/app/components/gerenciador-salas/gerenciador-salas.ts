import { Component, OnInit, HostListener, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bloco } from '../../model/bloco/bloco.model';
import { Sala } from '../../model/bloco/sala.model';
import { BlocoService } from '../../service/bloco/bloco.service';
import { AuthService } from '../../service/auth/auth.service';
import { NgxPanZoomModule } from 'ngx-panzoom';

// Re-definir a interface PanZoomConfig (COMPLETA)
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
  selector: 'app-gerenciador-salas',
  standalone: true,  
  imports: [CommonModule, FormsModule, NgxPanZoomModule],
  templateUrl: './gerenciador-salas.html',
  styleUrls: ['./gerenciador-salas.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GerenciadorSalasComponent implements OnInit {

  public blocos: Bloco[] = [];
  isLoading = true;
  error: string | null = null;
  isAdmin = false;
  public activeBlocoId: number | null = null;
  public editingSala: Sala | null = null;

  // --- Propriedades para o Drag and Drop ---
  public isDragging = false;
  public draggingSala: Sala | null = null;
  private dragOffset = { x: 0, y: 0 };
  private svgElement: SVGSVGElement | null = null;
  private hasMoved = false; // Flag para diferenciar clique de arrastar

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
  } = {
    codigo: '',
    capacidade: null,
    posX: 50,
    posY: 50,
    largura: 150,
    altura: 100
  };
  blocoSelecionadoId: number | null = null;

  constructor(
    private blocoService: BlocoService,
    private authService: AuthService,
    private el: ElementRef // Usado para querySelector
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.carregarBlocos();
  }

  getPageTitle(): string {
    return this.isAdmin ? 'Planta do Campus' : 'Mapa do Campus';
  }

  getPageSubtitle(): string {
    return this.isAdmin ? 'Visualize e gerencie os blocos e salas da instituição.' : 'Explore o mapa dos blocos e salas da instituição.';
  }

  private checkUserRole(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
  }

  // --- Lógica de Drag and Drop (Apenas para Admin) ---

  onMouseDown(event: MouseEvent, sala: Sala): void {
    if (!this.isAdmin) return; // Garante que só admin pode iniciar drag
    event.stopPropagation(); // Evita que o evento se propague para o pan-zoom
    event.preventDefault(); // Evita o comportamento padrão do navegador

    this.isDragging = true;
    this.hasMoved = false; // Reseta a flag de movimento
    this.draggingSala = sala;

    this.svgElement = (this.el.nativeElement as HTMLElement).querySelector('.floorplan-svg');
    const point = this.getSVGPoint(event.clientX, event.clientY);

    this.dragOffset = {
      x: point.x - (sala.posX ?? 0),
      y: point.y - (sala.posY ?? 0)
    };
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.draggingSala) return;
    this.hasMoved = true; // Seta a flag se houve movimento
    const point = this.getSVGPoint(event.clientX, event.clientY);

    let newX = Math.round(point.x - this.dragOffset.x);
    let newY = Math.round(point.y - this.dragOffset.y);

    const viewBox = { width: 1600, height: 900 }; // ViewBox do SVG (verifique se corresponde ao seu SVG)
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

  @HostListener('window:mouseup')
  @HostListener('window:mouseleave')
  onMouseUpOrLeave(): void {
    if (!this.isDragging || !this.draggingSala) return;

    if (this.hasMoved) { // Se a sala foi arrastada
        this.updateSalaPosition(this.draggingSala);
    } else { // Se foi apenas um clique (não houve movimento significativo)
        if (this.isAdmin) { // E se for admin, então selecione a sala
            this.selectSala(this.draggingSala);
        }
    }
    this.cancelDrag();
  }

  private cancelDrag(): void {
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
    if (!this.isAdmin) return;
    this.editingSala = sala;
    this.formSala = {
      codigo: sala.codigo,
      capacidade: sala.capacidade,
      posX: sala.posX ?? 50,
      posY: sala.posY ?? 50,
      largura: sala.largura ?? 150,
      altura: sala.altura ?? 100
    };
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
      altura: 100
    };
  }

  carregarBlocos(): void {
    this.isLoading = true;
    this.blocoService.getBlocos().subscribe({
      next: (data) => {
        this.blocos = data.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        if (this.blocos.length > 0 && this.blocoSelecionadoId === null) {
            this.blocoSelecionadoId = this.blocos[0].id;
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
      altura: this.formSala.altura
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
}