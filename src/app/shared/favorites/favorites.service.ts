import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Favorite {
  id: string;
  type: 'curso' | 'turma' | 'disciplina' | 'professor' | 'sala';
  entityId: number;
  name: string;
  description?: string;
  addedAt: Date;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'ifclass-favorites';
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  
  public favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored).map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        }));
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      this.favoritesSubject.next([]);
    }
  }

  private saveFavorites(): void {
    try {
      const favorites = this.favoritesSubject.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }

  addFavorite(favorite: Omit<Favorite, 'id' | 'addedAt'>): void {
    const currentFavorites = this.favoritesSubject.value;
    
    // Verificar se já existe
    const exists = currentFavorites.some(fav => 
      fav.type === favorite.type && fav.entityId === favorite.entityId
    );

    if (exists) {
      return; // Já está nos favoritos
    }

    const newFavorite: Favorite = {
      ...favorite,
      id: this.generateId(),
      addedAt: new Date()
    };

    const updatedFavorites = [...currentFavorites, newFavorite];
    this.favoritesSubject.next(updatedFavorites);
    this.saveFavorites();
  }

  removeFavorite(type: string, entityId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(fav => 
      !(fav.type === type && fav.entityId === entityId)
    );
    
    this.favoritesSubject.next(updatedFavorites);
    this.saveFavorites();
  }

  isFavorite(type: string, entityId: number): boolean {
    const currentFavorites = this.favoritesSubject.value;
    return currentFavorites.some(fav => 
      fav.type === type && fav.entityId === entityId
    );
  }

  getFavoritesByType(type: string): Favorite[] {
    return this.favoritesSubject.value.filter(fav => fav.type === type);
  }

  getAllFavorites(): Favorite[] {
    return this.favoritesSubject.value;
  }

  clearAllFavorites(): void {
    this.favoritesSubject.next([]);
    this.saveFavorites();
  }

  toggleFavorite(favorite: Omit<Favorite, 'id' | 'addedAt'>): boolean {
    const isFav = this.isFavorite(favorite.type, favorite.entityId);
    
    if (isFav) {
      this.removeFavorite(favorite.type, favorite.entityId);
      return false;
    } else {
      this.addFavorite(favorite);
      return true;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Métodos de conveniência para cada tipo
  addCursoFavorite(curso: any): void {
    this.addFavorite({
      type: 'curso',
      entityId: curso.id,
      name: curso.nome,
      description: `${curso.codigo} - ${curso.departamento}`,
      metadata: { cargaHoraria: curso.cargaHoraria }
    });
  }

  addTurmaFavorite(turma: any): void {
    this.addFavorite({
      type: 'turma',
      entityId: turma.id,
      name: `${turma.curso?.nome || 'Curso'} ${turma.ano}.${turma.semestre}`,
      description: `Turma ${turma.ano}/${turma.semestre}º`,
      metadata: { ano: turma.ano, semestre: turma.semestre }
    });
  }

  addDisciplinaFavorite(disciplina: any): void {
    this.addFavorite({
      type: 'disciplina',
      entityId: disciplina.id,
      name: disciplina.nome,
      description: `${disciplina.codigo} - ${disciplina.departamento}`,
      metadata: { cargaHoraria: disciplina.cargaHoraria }
    });
  }

  addProfessorFavorite(professor: any): void {
    this.addFavorite({
      type: 'professor',
      entityId: professor.id,
      name: professor.nome,
      description: 'Professor',
      metadata: { email: professor.email }
    });
  }

  addSalaFavorite(sala: any): void {
    this.addFavorite({
      type: 'sala',
      entityId: sala.id,
      name: sala.codigo,
      description: `Capacidade: ${sala.capacidade}`,
      metadata: { capacidade: sala.capacidade }
    });
  }

  // Métodos para verificar se é favorito
  isCursoFavorite(cursoId: number): boolean {
    return this.isFavorite('curso', cursoId);
  }

  isTurmaFavorite(turmaId: number): boolean {
    return this.isFavorite('turma', turmaId);
  }

  isDisciplinaFavorite(disciplinaId: number): boolean {
    return this.isFavorite('disciplina', disciplinaId);
  }

  isProfessorFavorite(professorId: number): boolean {
    return this.isFavorite('professor', professorId);
  }

  isSalaFavorite(salaId: number): boolean {
    return this.isFavorite('sala', salaId);
  }
}
