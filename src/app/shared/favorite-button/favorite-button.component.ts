import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../favorites/favorites.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="btn btn-sm favorite-btn"
      [class.favorited]="isFavorited"
      (click)="toggleFavorite()"
      [title]="isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'">
      <i [class]="isFavorited ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
    </button>
  `,
  styles: [`
    .favorite-btn {
      border: none;
      background: transparent;
      color: #6c757d;
      transition: all 0.3s ease;
      padding: 4px 8px;
    }

    .favorite-btn:hover {
      color: #dc3545;
      background-color: rgba(220, 53, 69, 0.1);
      transform: scale(1.1);
    }

    .favorite-btn.favorited {
      color: #dc3545;
    }

    .favorite-btn.favorited:hover {
      color: #6c757d;
      background-color: rgba(108, 117, 125, 0.1);
    }

    .favorite-btn i {
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .favorite-btn:hover i {
      transform: scale(1.2);
    }
  `]
})
export class FavoriteButtonComponent implements OnInit {
  @Input() type!: 'curso' | 'turma' | 'disciplina' | 'professor' | 'sala';
  @Input() entity!: any;
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';

  isFavorited = false;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit() {
    if (this.entity && this.entity.id) {
      this.isFavorited = this.favoritesService.isFavorite(this.type, this.entity.id);
    }
  }

  toggleFavorite() {
    if (!this.entity || !this.entity.id) {
      return;
    }

    const favoriteData = this.buildFavoriteData();
    this.isFavorited = this.favoritesService.toggleFavorite(favoriteData);
  }

  private buildFavoriteData() {
    switch (this.type) {
      case 'curso':
        return {
          type: this.type,
          entityId: this.entity.id,
          name: this.entity.nome,
          description: `${this.entity.codigo} - ${this.entity.departamento}`,
          metadata: { cargaHoraria: this.entity.cargaHoraria }
        };
      
      case 'turma':
        return {
          type: this.type,
          entityId: this.entity.id,
          name: `${this.entity.curso?.nome || 'Curso'} ${this.entity.ano}.${this.entity.semestre}`,
          description: `Turma ${this.entity.ano}/${this.entity.semestre}º`,
          metadata: { ano: this.entity.ano, semestre: this.entity.semestre }
        };
      
      case 'disciplina':
        return {
          type: this.type,
          entityId: this.entity.id,
          name: this.entity.nome,
          description: `${this.entity.codigo} - ${this.entity.departamento}`,
          metadata: { cargaHoraria: this.entity.cargaHoraria }
        };
      
      case 'professor':
        return {
          type: this.type,
          entityId: this.entity.id,
          name: this.entity.nome,
          description: 'Professor',
          metadata: { email: this.entity.email }
        };
      
      case 'sala':
        return {
          type: this.type,
          entityId: this.entity.id,
          name: this.entity.codigo,
          description: `Capacidade: ${this.entity.capacidade}`,
          metadata: { capacidade: this.entity.capacidade }
        };
      
      default:
        return {
          type: this.type,
          entityId: this.entity.id,
          name: this.entity.nome || this.entity.codigo || 'Item',
          description: 'Item favoritado'
        };
    }
  }
}
