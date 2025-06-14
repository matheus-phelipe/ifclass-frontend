import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bloco } from '../../model/bloco/bloco.model';
import { BlocoService } from '../../service/bloco/bloco.service';
import { AuthService } from '../../service/auth/auth.service';
import { Sala } from '../../model/bloco/sala.model';

@Component({
  selector: 'app-gerenciador-salas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciador-salas.html',
  styleUrls: ['./gerenciador-salas.css']
})
export class GerenciadorSalasComponent implements OnInit {

  public blocos: (Bloco & { salasEsquerda: Sala[], salasDireita: Sala[] })[] = [];
  isLoading = true;
  error: string | null = null;
  isAdmin = false; 

  // NOVO: Propriedade para controlar qual bloco está expandido
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

  // NOVO: Método para expandir/recolher um bloco
  toggleBloco(blocoId: number): void {
    if (this.activeBlocoId === blocoId) {
      this.activeBlocoId = null; // Recolhe o bloco se ele já estiver aberto
    } else {
      this.activeBlocoId = blocoId; // Abre o bloco clicado
    }
  }

  carregarBlocos(): void {
    this.isLoading = true;
    this.blocoService.getBlocos().subscribe({
      next: (data) => {
        this.blocos = data
          .map(bloco => {
            const salasEsquerda: Sala[] = [];
            const salasDireita: Sala[] = [];
            const salasOrdenadas = [...bloco.salas].sort((a, b) => a.codigo.localeCompare(b.codigo));
            
            salasOrdenadas.forEach((sala, index) => {
              if (index % 2 === 0) {
                salasEsquerda.push(sala);
              } else {
                salasDireita.push(sala);
              }
            });
            return { ...bloco, salasEsquerda, salasDireita };
          })
          .sort((a, b) => a.id - b.id);

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

  handleCreateBloco(): void {
    if (!this.novoBlocoNome.trim()) return;
    this.blocoService.createBloco(this.novoBlocoNome).subscribe({
      next: (novoBloco) => {
        this.novoBlocoNome = '';
        this.carregarBlocos();
        this.activeBlocoId = novoBloco.id; // Abre o bloco recém-criado
      },
      error: (err) => { this.error = 'Falha ao criar bloco.'; console.error(err); }
    });
  }

  handleCreateSala(): void {
    if (!this.novaSalaCodigo.trim() || this.novaSalaCapacidade === null || this.blocoSelecionadoId === null) {
      this.error = "Por favor, preencha todos os campos da sala.";
      return;
    }
    const novaSala = { 
      codigo: this.novaSalaCodigo, 
      capacidade: this.novaSalaCapacidade 
    };
    this.blocoService.addSala(this.blocoSelecionadoId, novaSala).subscribe({
      next: () => {
        this.novaSalaCodigo = '';
        this.novaSalaCapacidade = null;
        this.error = null;
        this.carregarBlocos();
      },
      error: (err) => { this.error = 'Falha ao criar sala.'; console.error(err); }
    });
  }

  // ATUALIZADO: Lógica para recolher o acordeão se o bloco deletado estiver aberto
  handleDeleteBloco(id: number): void {
    if (confirm('Tem certeza que deseja apagar este bloco e todas as suas salas?')) {
      this.blocoService.deleteBloco(id).subscribe({
        next: () => {
            if(this.blocoSelecionadoId === id) {
                this.blocoSelecionadoId = null;
            }
            // Se o bloco deletado era o que estava expandido, fecha o acordeão.
            if(this.activeBlocoId === id) {
                this.activeBlocoId = null;
            }
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