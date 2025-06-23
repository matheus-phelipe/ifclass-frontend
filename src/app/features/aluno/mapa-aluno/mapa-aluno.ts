// ARQUIVO: src/app/components/aluno/mapa-aluno/mapa-aluno.component.ts

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bloco } from '../bloco.model';
import { Sala } from '../sala.model';
import { BlocoService } from '../bloco.service';
import { NgxPanZoomModule } from 'ngx-panzoom'; 
import { AuthService } from '../../../service/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { ProfileSwitcherComponent } from '../../../shared/profile-switcher/profile-switcher';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/sweetalert/notification.service';
import { AulaService } from '../../aulas/aula.service';
import { Aula } from '../../aulas/aula.model';
import { AlunoTurmaService } from '../aluno-turma.service';
import { DiaSemanaPipe } from './dia-semana.pipe';

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
  imports: [CommonModule, FormsModule, NgxPanZoomModule, ProfileSwitcherComponent, DiaSemanaPipe],
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

  aulasHoje: Aula[] = [];
  salasAulaHoje: number[] = [];
  aulasSemana: Aula[] = [];
  alunoTemTurmaMasSemAulas = false;

  // Propriedades para o novo layout
  mobileMenuOpen = false;
  legendExpanded = false;

  constructor(
    private blocoService: BlocoService,
    public authService: AuthService,
    private el: ElementRef,
    private router: Router,
    private notificationService: NotificationService,
    private aulaService: AulaService,
    private alunoTurmaService: AlunoTurmaService
  ) {}

  async ngOnInit(): Promise<void> {
    this.carregarBlocos();
    this.alunoTemTurmaMasSemAulas = false; // Resetar a flag
    if (this.authService.getActiveRole() === 'ROLE_ALUNO') {
      const usuarioId = this.authService.getIdUsuario();
      if (usuarioId) {
        this.alunoTurmaService.buscarTurmaDoAluno(usuarioId).subscribe({
          next: turma => {
            if (turma && turma.id) {
              // Buscar aulas do dia
              const hoje = new Date();
              const dataStr = hoje.toISOString().slice(0, 10);
              this.aulaService.buscarPorTurmaEData(turma.id, dataStr).subscribe(aulas => {
                this.aulasHoje = aulas;
                this.salasAulaHoje = aulas.map(a => a.sala.id);
              });
              // Buscar aulas da semana
              const aulasSemana: Aula[] = [];
              const promises = [];
              for (let i = 0; i < 7; i++) {
                const data = new Date();
                data.setDate(hoje.getDate() - hoje.getDay() + i); // Domingo a Sábado
                const dataSemanaStr = data.toISOString().slice(0, 10);
                promises.push(this.aulaService.buscarPorTurmaEData(turma.id, dataSemanaStr).toPromise().then(aulas => {
                  if (aulas && aulas.length > 0) aulasSemana.push(...aulas);
                }));
              }
              Promise.all(promises).then(() => {
                this.aulasSemana = aulasSemana;
                if (this.aulasSemana.length === 0) {
                  this.alunoTemTurmaMasSemAulas = true;
                }
              });
            }
          },
          error: (err) => {
            // Se o erro for 404, significa que o aluno não está em nenhuma turma.
            // Isso é um estado esperado para um admin ou usuário novo, não um erro de sistema.
            if (err.status !== 404) {
              // Para outros erros, mostramos a notificação.
              this.notificationService.warn('Erro', 'Ocorreu um erro ao buscar os dados do aluno.');
            }
            // Em caso de 404, não fazemos nada, a tela já mostra "Nenhuma aula".
          }
        });
      }
    }
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

  async handleDeleteBloco(id: number): Promise<void> {
    const isConfirmed = await this.notificationService.confirmDelete(
      'Apagar Bloco?',
      'Isso apagará o bloco E TODAS as salas contidas nele. Esta ação é irreversível!'
    );

    if (isConfirmed) {
      this.blocoService.deleteBloco(id).subscribe({
        next: () => {
          if (this.blocoSelecionadoId === id) this.blocoSelecionadoId = null;
          if (this.activeBlocoId === id) this.activeBlocoId = null;
          this.carregarBlocos();
          this.notificationService.success('Tudo Apagado!', 'O bloco e suas salas foram removidos.');
        },
        error: () => { this.error = 'Falha ao deletar bloco.' }
      });
    }
  }

  async handleDeleteSala(blocoId: number, salaId: number): Promise<void> {
    const isConfirmed = await this.notificationService.confirmDelete(
      'Apagar esta sala?',
      'Você realmente deseja apagar esta sala?'
    );

    if (isConfirmed) {
      this.blocoService.deleteSala(blocoId, salaId).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarBlocos();
          this.notificationService.success('Apagada!', 'A sala foi removida com sucesso.');
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
  }

  // Método utilitário para saber se a sala é de aula hoje
  isSalaAulaHoje(salaId: number): boolean {
    return this.salasAulaHoje.includes(salaId);
  }

  voltarAoPainelAdmin(): void {
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.authService.setActiveRole('ROLE_ADMIN');
      this.router.navigate(['/app/home']);
    }
  }

  // Métodos para o novo layout
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  selectBloco(blocoId: number): void {
    this.activeBlocoId = blocoId;
    this.mobileMenuOpen = false; // Fecha o menu mobile após seleção
    this.cancelarEdicao();
  }

  toggleLegend(): void {
    this.legendExpanded = !this.legendExpanded;
  }

  showCreateBlocoModal(): void {
    // Implementar modal para criar bloco no mobile
    // Por enquanto, usar prompt simples
    const nome = prompt('Nome do novo bloco:');
    if (nome?.trim()) {
      this.novoBlocoNome = nome.trim();
      this.handleCreateBloco();
    }
  }

  showCreateSalaModal(): void {
    // Implementar modal para criar sala no mobile
    // Por enquanto, redirecionar para o formulário desktop
    this.mobileMenuOpen = false;
    // Scroll para o formulário se estiver visível
  }
}