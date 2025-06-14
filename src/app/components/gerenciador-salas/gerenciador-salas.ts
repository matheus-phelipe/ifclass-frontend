import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bloco } from '../../model/bloco/bloco.model';
import { BlocoService } from '../../service/bloco/bloco.service';
import { AuthService } from '../../service/auth/auth.service';
import { Sala } from '../../model/bloco/sala.model';

interface SalaComLayout extends Sala {
  gridArea: string;
}

// ATUALIZADO: Interface do bloco para incluir as salas e a configuração do grid
interface BlocoComLayout extends Bloco {
  salasComLayout: SalaComLayout[];
  gridRows: string; // Ex: 'repeat(5, 1fr)'
}

@Component({
  selector: 'app-gerenciador-salas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciador-salas.html',
  styleUrls: ['./gerenciador-salas.css']
})
export class GerenciadorSalasComponent implements OnInit {

  public blocos: BlocoComLayout[] = [];
  isLoading = true;
  error: string | null = null;
  isAdmin = false; 
  public activeBlocoId: number | null = null;

  novoBlocoNome = '';
  blocoSelecionadoId: number | null = null;
  novaSalaCodigo = '';
  novaSalaCapacidade: number | null = null;

  constructor(
    private blocoService: BlocoService, 
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkUserRole();
    this.carregarBlocos();
  }

  private checkUserRole(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
  }

  toggleBloco(blocoId: number): void {
    this.activeBlocoId = this.activeBlocoId === blocoId ? null : blocoId;
  }

  carregarBlocos(): void {
    this.isLoading = true;
    this.blocoService.getBlocos().subscribe({
      next: (data) => {
        this.blocos = data.map(bloco => {
          const salasOrdenadas = [...bloco.salas].sort((a, b) => a.codigo.localeCompare(b.codigo));
          
          const salasComLayout = salasOrdenadas.map((sala, index): SalaComLayout => {
            const row = Math.floor(index / 2) + 1;
            const col = (index % 2 === 0) ? 1 : 3;
            return { ...sala, gridArea: `${row} / ${col}` };
          });
          
          // **CORREÇÃO PRINCIPAL**: Calcula quantas linhas o grid precisa
          const numeroDeLinhas = Math.ceil(salasOrdenadas.length / 2);
          const gridRows = `repeat(${numeroDeLinhas > 0 ? numeroDeLinhas : 1}, auto)`;

          return { ...bloco, salasComLayout, gridRows };
        }).sort((a, b) => a.id - b.id);

        if (this.blocos.length > 0 && this.blocoSelecionadoId === null) {
            this.blocoSelecionadoId = this.blocos[0].id;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Falha ao carregar os dados do campus.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // Métodos de CRUD não precisam de alteração na lógica, apenas o recarregamento dos blocos já faz o trabalho.
  handleCreateBloco(): void {
    if (!this.novoBlocoNome.trim()) return;
    this.blocoService.createBloco(this.novoBlocoNome).subscribe({
      next: (novoBloco) => {
        this.novoBlocoNome = '';
        this.carregarBlocos();
        this.activeBlocoId = novoBloco.id;
      },
      error: (err) => { this.error = 'Falha ao criar bloco.'; console.error(err); }
    });
  }

  handleCreateSala(): void {
    if (!this.novaSalaCodigo.trim() || this.novaSalaCapacidade === null || this.blocoSelecionadoId === null) {
      this.error = "Por favor, preencha todos os campos da sala.";
      return;
    }
    const novaSala = { codigo: this.novaSalaCodigo, capacidade: this.novaSalaCapacidade };
    this.blocoService.addSala(this.blocoSelecionadoId, novaSala).subscribe({
      next: () => {
        this.novaSalaCodigo = ''; this.novaSalaCapacidade = null; this.error = null;
        this.carregarBlocos();
      },
      error: (err) => { this.error = 'Falha ao criar sala.'; console.error(err); }
    });
  }

  handleDeleteBloco(id: number): void {
    if (confirm('Tem certeza que deseja apagar este bloco e todas as suas salas?')) {
      this.blocoService.deleteBloco(id).subscribe({
        next: () => {
            if(this.blocoSelecionadoId === id) this.blocoSelecionadoId = null;
            if(this.activeBlocoId === id) this.activeBlocoId = null;
            this.carregarBlocos()
        },
        error: (err) => { this.error = 'Falha ao deletar bloco.'; console.error(err); }
      });
    }
  }

  handleDeleteSala(blocoId: number, salaId: number): void {
     this.blocoService.deleteSala(blocoId, salaId).subscribe({
        next: () => this.carregarBlocos(),
        error: (err) => { this.error = 'Falha ao deletar sala.'; console.error(err); }
     });
  }
}