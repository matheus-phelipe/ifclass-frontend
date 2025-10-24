// ARQUIVO: src/app/components/aluno/mapa-aluno/mapa-aluno.component.ts

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import Swal from 'sweetalert2';

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
  public blocoSelecionadoId: number | null = null;
  
  // Propriedades para o novo design
  public currentTime = new Date();
  public proximaAula: any = null;
  public blocoAtual: Bloco | null = null;
  public aulasDoBloco: any[] = [];
  public aulasHoje: any[] = [];
  public todasAulasHoje: any[] = []; // Todas as aulas do dia para visitantes
  public isLoggedIn = false;
  public isStudent = false; // Se é aluno logado
  
  // Filtros de data
  public filtroPeriodo: string = 'hoje';
  public dataInicial: string = '';
  public dataFinal: string = '';
  public adminPanelExpanded: boolean = false;

  // --- Propriedades para o Drag and Drop ---
  public isDragging = false;
  public draggingSala: Sala | null = null;

  // Propriedades para tooltip dinâmico
  public tooltipVisible: boolean = false;
  public tooltipX: number = 0;
  public tooltipY: number = 0;
  public tooltipSala: Sala | null = null;
  private dragOffset = { x: 0, y: 0 };
  private svgElement: SVGSVGElement | null = null;
  private hasMoved = false; // Flag para diferenciar clique de arrastar
  private dragStartPoint = { x: 0, y: 0 }; 
  private readonly DRAG_THRESHOLD = 5; // Distância em pixels para considerar um "arrastar" em vez de um "clique"

  // --- CONFIGURAÇÃO NGX-PANZOOM (OTIMIZADA PARA TOTEM) ---
  public panZoomConfig: PanZoomConfig = {
    zoomFactor: 0.2,       // Mais responsivo para totem
    minScale: 0.1,         // Permite zoom out maior para ver todas as salas
    maxScale: 8,           // Zoom máximo maior para detalhes
    panOnClick: true,      // Permite arrastar o mapa clicando e arrastando
    zoomOnDoubleClick: true, // Zoom ao dar dois cliques
    zoomOnMouseWheel: true,  // Zoom com a roda do mouse
    invertMouseWheel: false,
    freeMouseWheel: false,
    initialZoomToFit: true, // Ajuste inicial para mostrar todas as salas
    zoomOnPinch: true,     // MUITO IMPORTANTE PARA TOUCH
    keepInBounds: true,    // Tenta manter o conteúdo dentro dos limites visíveis
    initialZoom: 0.3,     // Zoom inicial menor para mostrar mais salas
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
    private alunoTurmaService: AlunoTurmaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    // Atualizar tempo atual
    this.currentTime = new Date();
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    // Verificar se o usuário está logado
    this.isLoggedIn = this.authService.isAuthenticated();
    this.isStudent = this.authService.hasRole('ROLE_ALUNO');
    
    this.carregarBlocos();
    
    // SEMPRE carregar TODAS as aulas para TODOS os usuários
    this.carregarTodasAulasHoje();
    
    // Se estiver logado como aluno, carregar suas aulas específicas para destaque
    if (this.isLoggedIn && this.isStudent) {
      this.carregarAulasHoje();
    }
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
    // Verificar se é admin
    if (!this.authService.isRoleActiveOrHigher('ROLE_ADMIN')) {
      console.log('Apenas administradores podem mover salas');
      return;
    }
    
    // Adicionar classe de dragging para feedback visual
    const salaElement = event.target as HTMLElement;
    if (salaElement) {
      salaElement.classList.add('dragging');
    }
    
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

    // Corrigido: usar o viewBox real do SVG (3200x1800)
    const viewBox = { width: 3200, height: 1800 };
    const salaWidth = this.draggingSala.largura ?? 150;
    const salaHeight = this.draggingSala.altura ?? 100;

    // Permite movimento em toda a área do viewBox
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

  // --- Métodos para a Imagem Aérea do Campus ---

  onImageError(event: any): void {
    // Esconde a imagem e mostra o fallback
    event.target.style.display = 'none';
    const fallback = document.getElementById('image-fallback');
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }

  onImageLoad(event: any): void {
    // Garante que a imagem está visível e o fallback escondido
    event.target.style.display = 'block';
    const fallback = document.getElementById('image-fallback');
    if (fallback) {
      fallback.style.display = 'none';
    }
  }

  selecionarBlocoFisico(nomeBloco: string): void {
    // Encontra o bloco pelo nome e seleciona
    const bloco = this.blocos.find(b => b.nome.toUpperCase().includes(nomeBloco.toUpperCase()));
    if (bloco && bloco.id) {
      this.activeBlocoId = bloco.id;
      this.blocoSelecionadoId = bloco.id; // Define também para adicionar salas
      this.cancelarEdicao();
    }
  }

  blocoTemAulasHoje(nomeBloco: string): boolean {
    // Verifica se alguma sala do bloco tem aulas hoje
    const bloco = this.blocos.find(b => b.nome.toUpperCase().includes(nomeBloco.toUpperCase()));
    if (!bloco) return false;

    return bloco.salas.some(sala => this.isSalaAulaHoje(sala.id));
  }

  getSalasCount(nomeBloco: string): number {
    // Retorna o número de salas do bloco
    const bloco = this.blocos.find(b => b.nome.toUpperCase().includes(nomeBloco.toUpperCase()));
    return bloco?.salas?.length || 0;
  }

  // --- Fim dos Métodos da Imagem Aérea ---

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
    // Quando um bloco é selecionado, definir como padrão para adicionar novas salas
    if (this.activeBlocoId !== null) {
      this.blocoSelecionadoId = this.activeBlocoId;
    }
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
          this.blocoSelecionadoId = this.blocos[0].id; // Define também para adicionar salas
        }
        
        this.isLoading = false;
      },
      error: (error) => {
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
        next: () => {
          this.cancelarEdicao();
          this.carregarBlocos();
        },
        error: (err) => {
          this.error = 'Falha ao atualizar a sala.';
        }
      });
    } else {
      this.blocoService.addSala(this.blocoSelecionadoId, salaData).subscribe({
        next: (response) => {
          this.cancelarEdicao();
          this.carregarBlocos();
        },
        error: (err) => {
          this.error = 'Falha ao criar a sala.';
        }
      });
    }
  }

  async handleDeleteBloco(id?: number): Promise<void> {
    // Se não foi passado um ID, mostrar lista de blocos para escolher
    if (!id) {
      this.showDeleteBlocoModal();
      return;
    }

    const bloco = this.blocos.find(b => b.id === id);
    const blocoNome = bloco ? bloco.nome : 'este bloco';
    
    const isConfirmed = await this.notificationService.confirmDelete(
      'Apagar Bloco?',
      `Isso apagará o ${blocoNome} E TODAS as salas contidas nele. Esta ação é irreversível!`
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

  showDeleteBlocoModal(): void {
    // Criar lista de opções de blocos
    const blocosOptions = this.blocos.map(bloco => ({
      value: bloco.id,
      text: `${bloco.nome} (${bloco.salas.length} salas)`
    }));

    if (blocosOptions.length === 0) {
      this.notificationService.warn('Aviso', 'Não há blocos para excluir.');
      return;
    }

    // Usar SweetAlert2 para mostrar lista de blocos
    Swal.fire({
      title: 'Excluir Bloco',
      text: 'Selecione qual bloco deseja excluir:',
      input: 'select',
      inputOptions: blocosOptions.reduce((acc, option) => {
        acc[option.value] = option.text;
        return acc;
      }, {} as { [key: string]: string }),
      showCancelButton: true,
      confirmButtonText: 'Excluir Bloco',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa selecionar um bloco!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.handleDeleteBloco(parseInt(result.value));
      }
    });
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

  // Método utilitário para saber se a sala é de aula hoje
  isSalaAulaHoje(salaId: number): boolean {
    // Se filtro for por semana e usuário logado, verificar se tem aula na semana
    if (this.filtroPeriodo === 'semana' && this.isLoggedIn && this.isStudent) {
      return this.todasAulasHoje.some(aula => aula.sala.id === salaId && this.isAulaDoUsuario(aula));
    }
    
    // Para outros casos, usar a lógica original
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


  getDayName(diaSemana: string): string {
    const dias: { [key: string]: string } = {
      'SEGUNDA': 'Seg',
      'TERÇA': 'Ter', 
      'QUARTA': 'Qua',
      'QUINTA': 'Qui',
      'SEXTA': 'Sex',
      'SÁBADO': 'Sáb',
      'DOMINGO': 'Dom'
    };
    return dias[diaSemana] || diaSemana;
  }

  getActiveBlocoSalasCount(): number {
    const bloco = this.blocos.find(b => b.id === this.activeBlocoId);
    return bloco ? bloco.salas.length : 0;
  }

  // Métodos para o novo design
  blocoTemAula(blocoId: number): boolean {
    // Verificar se o bloco tem aulas hoje através das salas
    const bloco = this.blocos.find(b => b.id === blocoId);
    if (!bloco) return false;
    
    return bloco.salas.some(sala => this.salasAulaHoje.includes(sala.id));
  }

  getBlocoIcon(nome: string): string {
    const icons: { [key: string]: string } = {
      'A': 'bi bi-building',
      'B': 'bi bi-building',
      'C': 'bi bi-building',
      'D': 'bi bi-building',
      'E': 'bi bi-building',
      'F': 'bi bi-building',
      'G': 'bi bi-building',
      'H': 'bi bi-building',
      'I': 'bi bi-building',
      'J': 'bi bi-building'
    };
    return icons[nome] || 'bi bi-building';
  }

  refreshAulas(): void {
    // Atualizar aulas do dia
    this.carregarAulasHoje();
  }

  salaTemAula(salaId: number): boolean {
    // Verificar se a sala tem aula hoje
    return this.aulasHoje.some(aula => aula.salaId === salaId);
  }

  isAulaAtual(aula: any): boolean {
    const agora = new Date();
    const horaAtual = agora.getHours() * 60 + agora.getMinutes();
    const [horaInicio, minutoInicio] = aula.hora.split(':').map(Number);
    const [horaFim, minutoFim] = aula.horaFim.split(':').map(Number);
    const inicioMinutos = horaInicio * 60 + minutoInicio;
    const fimMinutos = horaFim * 60 + minutoFim;
    
    return horaAtual >= inicioMinutos && horaAtual <= fimMinutos;
  }

  getAulaStatus(aula: any): string {
    if (this.isAulaAtual(aula)) {
      return 'current';
    }
    const agora = new Date();
    const horaAtual = agora.getHours() * 60 + agora.getMinutes();
    const [horaInicio] = aula.hora.split(':').map(Number);
    const inicioMinutos = horaInicio * 60;
    
    return horaAtual < inicioMinutos ? 'upcoming' : 'completed';
  }

  getAulaStatusText(aula: any): string {
    const status = this.getAulaStatus(aula);
    switch (status) {
      case 'current': return 'Agora';
      case 'upcoming': return 'Em breve';
      case 'completed': return 'Finalizada';
      default: return 'Agendada';
    }
  }

  // Getters para compatibilidade
  get blocoSelecionado(): Bloco | null {
    return this.blocos.find(b => b.id === this.blocoSelecionadoId) || null;
  }

  // Método para carregar aulas do dia - CORRIGIDO
  public carregarAulasHoje(): void {
    // Se o usuário é aluno, carregar suas aulas
    if (this.authService.getActiveRole() === 'ROLE_ALUNO') {
      const usuarioId = this.authService.getIdUsuario();
      if (usuarioId) {
        this.alunoTurmaService.buscarTurmaDoAluno(usuarioId).subscribe({
          next: turma => {
            if (turma && turma.id) {
              const hoje = new Date();
              const dataStr = hoje.toISOString().slice(0, 10);
              this.aulaService.buscarPorTurmaEData(turma.id, dataStr).subscribe(aulas => {
                this.aulasHoje = aulas;
                this.salasAulaHoje = aulas.map(a => a.sala.id);
                
                // Definir próxima aula
                if (aulas.length > 0) {
                  this.proximaAula = aulas[0]; // Primeira aula do dia
                }
                
                // Se há um bloco selecionado, carregar suas aulas
                if (this.blocoSelecionadoId) {
                  this.aulasDoBloco = this.aulasHoje.filter(aula => {
                    const bloco = this.blocos.find(b => b.id === this.blocoSelecionadoId);
                    return bloco && bloco.salas.some(sala => sala.id === aula.sala.id);
                  });
                }
              });
            } else {
              // Se não tem turma, mostrar todas as aulas do dia
              this.carregarTodasAulasHoje();
            }
          },
          error: (error) => {
            console.error('Erro ao carregar turma do aluno:', error);
            // Se der erro, mostrar todas as aulas do dia
            this.carregarTodasAulasHoje();
          }
        });
      }
    } else {
      // Para outros usuários, mostrar todas as aulas
      this.carregarTodasAulasHoje();
    }
  }

  // Método para carregar todas as aulas do dia (para visitantes) - CORRIGIDO
  public carregarTodasAulasHoje(): void {
    // Usar o endpoint específico para aulas de hoje
    this.aulaService.buscarAulasDeHoje().subscribe({
      next: (aulas: any[]) => {
        this.todasAulasHoje = aulas;
        console.log('Aulas de hoje carregadas:', aulas);
      },
      error: (error: any) => {
        console.error('Erro ao carregar aulas de hoje:', error);
        this.todasAulasHoje = [];
      }
    });
  }

  // Método auxiliar para converter dia da semana JavaScript para português
  private getDiaSemanaPortugues(dia: number): string {
    const dias = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return dias[dia];
  }

  // Métodos para filtros de data
  aplicarFiltros(): void {
    console.log('Aplicando filtros:', this.filtroPeriodo);
    
    // Validar filtro selecionado
    if (!['hoje', 'semana'].includes(this.filtroPeriodo)) {
      this.filtroPeriodo = 'hoje';
    }
    
    this.carregarAulasComFiltro();
    
    // Atualizar aulas do bloco ativo
    if (this.activeBlocoId) {
      this.aulasDoBloco = this.getAulasDoBlocoAtivo();
    }
    
    // Forçar atualização da interface
    this.cdr.detectChanges();
  }

  limparFiltros(): void {
    this.filtroPeriodo = 'hoje';
    this.dataInicial = '';
    this.dataFinal = '';
    this.carregarTodasAulasHoje();
  }

  carregarAulasComFiltro(): void {
    // Implementar lógica de filtro baseada no período selecionado - CORRIGIDO
    switch (this.filtroPeriodo) {
      case 'hoje':
        this.carregarTodasAulasHoje();
        break;
      case 'semana':
        this.carregarAulasSemana();
        break;
      default:
        this.carregarTodasAulasHoje();
        this.filtroPeriodo = 'hoje';
    }
    
    // Carregar aulas do usuário se estiver logado
    if (this.isLoggedIn && this.isStudent) {
      this.carregarAulasHoje();
    }
    
    // Atualizar informações do bloco ativo
    if (this.activeBlocoId) {
      this.aulasDoBloco = this.getAulasDoBlocoAtivo();
    }
    
    // Forçar atualização da interface
    this.cdr.detectChanges();
  }

  carregarAulasSemana(): void {
    // Implementar carregamento de aulas da semana - CORRIGIDO
    this.aulaService.buscarTodas().subscribe({
      next: (aulas: any[]) => {
        // Como as aulas são por dias da semana (não por data específica),
        // vamos mostrar TODAS as aulas que têm dias da semana válidos
        console.log('Todas as aulas carregadas:', aulas);
        
        // Verificar diferentes formatos de dias da semana
        const diasSemana = [
          'DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO',
          'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado',
          'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado',
          'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
          'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
        
        const aulasSemana = aulas.filter(aula => {
          // Verificar se a aula tem diaSemana válido
          if (!aula.diaSemana) {
            console.log('Aula sem diaSemana:', aula);
            return false;
          }
          
          // Verificar se o dia da semana está na lista (case insensitive)
          const diaValido = diasSemana.includes(aula.diaSemana) || 
                          diasSemana.some(dia => dia.toLowerCase() === aula.diaSemana.toLowerCase());
          
          console.log(`Aula ${aula.id} - diaSemana: "${aula.diaSemana}", válido: ${diaValido}`);
          
          return diaValido;
        });
        
        this.todasAulasHoje = aulasSemana;
        console.log('Aulas da semana filtradas:', aulasSemana.length, 'de', aulas.length);
        console.log('Aulas da semana carregadas:', aulasSemana);
      },
      error: (error: any) => {
        console.error('Erro ao carregar aulas da semana:', error);
        this.todasAulasHoje = [];
      }
    });
  }

  carregarAulasMes(): void {
    // Implementar carregamento de aulas do mês
    this.carregarTodasAulasHoje(); // Por enquanto, usar o mesmo método
  }

  carregarAulasPersonalizado(): void {
    // Implementar carregamento de aulas personalizado
    this.carregarTodasAulasHoje(); // Por enquanto, usar o mesmo método
  }

  // Métodos para painel administrativo
  toggleAdminPanel(): void {
    this.adminPanelExpanded = !this.adminPanelExpanded;
  }

  showCreateBlocoModal(): void {
    // Usar SweetAlert2 para modal mais bonito
    Swal.fire({
      title: 'Criar Novo Bloco',
      text: 'Digite o nome do novo bloco:',
      input: 'text',
      inputPlaceholder: 'Ex: Bloco E - Laboratórios',
      showCancelButton: true,
      confirmButtonText: 'Criar Bloco',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.trim().length < 3) {
          return 'O nome deve ter pelo menos 3 caracteres!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.novoBlocoNome = result.value.trim();
        this.handleCreateBloco();
      }
    });
  }

  showCreateSalaModal(): void {
    if (!this.activeBlocoId) {
      this.notificationService.error('Erro', 'Selecione um bloco primeiro!');
      return;
    }

    // Modal para criar sala
    Swal.fire({
      title: 'Criar Nova Sala',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Código da Sala:</label>
            <input id="codigo" type="text" placeholder="Ex: A101" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Capacidade:</label>
            <input id="capacidade" type="number" placeholder="Ex: 30" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Largura (px):</label>
            <input id="largura" type="number" placeholder="Ex: 150" value="150" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Altura (px):</label>
            <input id="altura" type="number" placeholder="Ex: 100" value="100" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Criar Sala',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const codigo = (document.getElementById('codigo') as HTMLInputElement)?.value;
        const capacidade = (document.getElementById('capacidade') as HTMLInputElement)?.value;
        const largura = (document.getElementById('largura') as HTMLInputElement)?.value;
        const altura = (document.getElementById('altura') as HTMLInputElement)?.value;

        if (!codigo || !capacidade) {
          Swal.showValidationMessage('Código e capacidade são obrigatórios!');
          return false;
        }

        return {
          codigo: codigo.trim(),
          capacidade: parseInt(capacidade),
          largura: parseInt(largura) || 150,
          altura: parseInt(altura) || 100
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.criarSala(result.value);
      }
    });
  }

  criarSala(dados: any): void {
    const novaSala = {
      codigo: dados.codigo,
      capacidade: dados.capacidade,
      largura: dados.largura,
      altura: dados.altura,
      blocoId: this.activeBlocoId!,
      posX: 50,
      posY: 50,
      cor: '#FFFFFF'
    };

    // Usar o serviço de bloco para criar sala
    this.blocoService.addSala(this.activeBlocoId!, novaSala).subscribe({
      next: (sala: any) => {
        this.notificationService.success('Sucesso', 'Sala criada com sucesso!');
        this.carregarBlocos();
      },
      error: (error: any) => {
        this.notificationService.error('Erro', 'Erro ao criar sala: ' + (error.error?.message || 'Erro desconhecido'));
      }
    });
  }

  showEditSalasModal(): void {
    // Implementar modal de edição de salas
    this.mobileMenuOpen = false;
  }

  showCreateAulaModal(): void {
    // Implementar modal de criação de aula
    this.mobileMenuOpen = false;
  }

  showAulasModal(): void {
    // Implementar modal de visualização de aulas
    this.mobileMenuOpen = false;
  }

  navigateToUsers(): void {
    this.router.navigate(['/app/usuarios']);
  }

  navigateToUsersList(): void {
    this.router.navigate(['/app/usuarios']);
  }

  generateReport(): void {
    // Implementar geração de relatório
    this.notificationService.success('Relatório', 'Relatório gerado com sucesso!');
  }

  exportData(): void {
    // Implementar exportação de dados
    this.notificationService.success('Exportação', 'Dados exportados com sucesso!');
  }

  // Método para redirecionar para login
  public showLoginModal(): void {
    this.router.navigate(['/login']);
  }

  // Método para logout
  public logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.isStudent = false;
    this.aulasHoje = [];
    this.salasAulaHoje = [];
    this.proximaAula = null;
    this.notificationService.success('Logout realizado', 'Você saiu do sistema');
  }

  // Método para verificar se uma sala tem aula (para visitantes) - CORRIGIDO
  public salaTemAulaVisitante(salaId: number): boolean {
    // Se o usuário está logado como aluno, verificar suas aulas
    if (this.isLoggedIn && this.isStudent) {
      // Se filtro for por semana, verificar todas as aulas da semana
      if (this.filtroPeriodo === 'semana') {
        return this.todasAulasHoje.some(aula => aula.sala.id === salaId && this.isAulaDoUsuario(aula));
      }
      // Se filtro for por hoje, verificar apenas aulas de hoje
      return this.aulasHoje.some(aula => aula.sala.id === salaId);
    }
    
    // Para visitantes, mostrar todas as aulas
    return this.todasAulasHoje.some(aula => aula.sala.id === salaId);
  }

  // Método para verificar se um bloco tem aula (para visitantes) - CORRIGIDO
  public blocoTemAulaVisitante(blocoId: number): boolean {
    const bloco = this.blocos.find(b => b.id === blocoId);
    if (!bloco) return false;
    
    // Se o usuário está logado como aluno, verificar suas aulas
    if (this.isLoggedIn && this.isStudent) {
      // Se filtro for por semana, verificar todas as aulas da semana
      if (this.filtroPeriodo === 'semana') {
        return bloco.salas.some(sala => this.todasAulasHoje.some(aula => aula.sala.id === sala.id && this.isAulaDoUsuario(aula)));
      }
      // Se filtro for por hoje, verificar apenas aulas de hoje
      return bloco.salas.some(sala => this.aulasHoje.some(aula => aula.sala.id === sala.id));
    }
    
    // Para visitantes, mostrar todas as aulas
    return bloco.salas.some(sala => this.todasAulasHoje.some(aula => aula.sala.id === sala.id));
  }

  // Método para obter aulas de uma sala (para tooltip) - CORRIGIDO
  public getAulasDaSala(salaId: number): any[] {
    // SEMPRE mostrar todas as aulas da sala, independente do tipo de usuário
    return this.todasAulasHoje.filter(aula => aula.sala.id === salaId);
  }

  // Método para obter aulas do bloco ativo - CORRIGIDO
  public getAulasDoBlocoAtivo(): any[] {
    if (!this.activeBlocoId) return [];
    
    const bloco = this.blocos.find(b => b.id === this.activeBlocoId);
    if (!bloco) return [];
    
    // SEMPRE mostrar todas as aulas do bloco, independente do tipo de usuário
    const salasIds = bloco.salas.map(sala => sala.id);
    return this.todasAulasHoje.filter(aula => salasIds.includes(aula.sala.id));
  }

  // Método para verificar se uma aula é do usuário logado - CORRIGIDO
  public isAulaDoUsuario(aula: any): boolean {
    if (!this.isLoggedIn || !this.isStudent) return false;
    
    // Verificar se a aula está nas aulas específicas do aluno
    return this.aulasHoje.some(a => a.id === aula.id);
  }

  // Método para verificar se o usuário tem aula hoje - CORRIGIDO
  public usuarioTemAulaHoje(): boolean {
    if (!this.isLoggedIn) return false;
    
    if (this.isStudent) {
      return this.aulasHoje.length > 0;
    }
    
    // Para admins/professores, sempre mostrar que há aulas disponíveis
    return this.todasAulasHoje.length > 0;
  }

  // Métodos para tooltip dinâmico
  public onSalaMouseEnter(event: MouseEvent, sala: Sala): void {
    this.tooltipSala = sala;
    this.tooltipVisible = true;
    this.updateTooltipPosition(event);
  }

  public onSalaMouseLeave(): void {
    this.tooltipVisible = false;
    this.tooltipSala = null;
  }

  public onSalaMouseMove(event: MouseEvent): void {
    if (this.tooltipVisible) {
      this.updateTooltipPosition(event);
    }
  }

  public hideTooltip(): void {
    this.tooltipVisible = false;
    this.tooltipSala = null;
  }

  private updateTooltipPosition(event: MouseEvent): void {
    const rect = (event.target as Element).getBoundingClientRect();
    const containerRect = this.el.nativeElement.getBoundingClientRect();
    
    // Posicionar o tooltip ao lado do mouse
    this.tooltipX = event.clientX - containerRect.left + 10;
    this.tooltipY = event.clientY - containerRect.top - 10;
    
    // Ajustar se o tooltip sair da tela
    const tooltipWidth = 300; // Largura estimada do tooltip
    const tooltipHeight = 200; // Altura estimada do tooltip
    
    if (this.tooltipX + tooltipWidth > window.innerWidth) {
      this.tooltipX = event.clientX - containerRect.left - tooltipWidth - 10;
    }
    
    if (this.tooltipY - tooltipHeight < 0) {
      this.tooltipY = event.clientY - containerRect.top + 10;
    }
  }

  // Método para formatar o dia da semana para exibição
  public getDiaSemanaFormatado(diaSemana: string): string {
    if (!diaSemana) return '';
    
    // Mapear diferentes formatos para formato amigável
    const diasMap: { [key: string]: string } = {
      'DOMINGO': 'Dom',
      'SEGUNDA': 'Seg',
      'TERCA': 'Ter',
      'QUARTA': 'Qua',
      'QUINTA': 'Qui',
      'SEXTA': 'Sex',
      'SABADO': 'Sáb',
      'Domingo': 'Dom',
      'Segunda': 'Seg',
      'Terça': 'Ter',
      'Quarta': 'Qua',
      'Quinta': 'Qui',
      'Sexta': 'Sex',
      'Sábado': 'Sáb',
      'domingo': 'Dom',
      'segunda': 'Seg',
      'terça': 'Ter',
      'quarta': 'Qua',
      'quinta': 'Qui',
      'sexta': 'Sex',
      'sábado': 'Sáb',
      'SUNDAY': 'Dom',
      'MONDAY': 'Seg',
      'TUESDAY': 'Ter',
      'WEDNESDAY': 'Qua',
      'THURSDAY': 'Qui',
      'FRIDAY': 'Sex',
      'SATURDAY': 'Sáb',
      'Sunday': 'Dom',
      'Monday': 'Seg',
      'Tuesday': 'Ter',
      'Wednesday': 'Qua',
      'Thursday': 'Qui',
      'Friday': 'Sex',
      'Saturday': 'Sáb'
    };
    
    return diasMap[diaSemana] || diaSemana;
  }
}