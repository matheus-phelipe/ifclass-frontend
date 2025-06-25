import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date';
  options?: { value: any; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: any;
}

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="advanced-filters">
      <!-- Barra de Busca Principal -->
      <div class="search-bar mb-3">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control form-control-lg"
            [placeholder]="searchPlaceholder"
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
          />
          <button 
            class="btn btn-outline-secondary" 
            type="button"
            (click)="toggleFilters()"
            [class.active]="showFilters"
          >
            <i class="bi bi-funnel"></i>
            Filtros
            <span class="badge bg-primary ms-1" *ngIf="activeFiltersCount > 0">
              {{ activeFiltersCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Filtros Avançados (Expansível) -->
      <div class="filters-panel" [class.show]="showFilters" *ngIf="filterOptions.length > 0">
        <div class="card">
          <div class="card-body">
            <div class="row g-3">
              <!-- Filtros Dinâmicos -->
              <div class="col-md-6 col-lg-4" *ngFor="let filter of filterOptions">
                <label [for]="filter.key" class="form-label">{{ filter.label }}</label>
                
                <!-- Input Text -->
                <input
                  *ngIf="filter.type === 'text'"
                  type="text"
                  class="form-control"
                  [id]="filter.key"
                  [placeholder]="filter.placeholder || ''"
                  [(ngModel)]="filterValues[filter.key]"
                  (input)="onFilterChange()"
                />

                <!-- Input Number -->
                <input
                  *ngIf="filter.type === 'number'"
                  type="number"
                  class="form-control"
                  [id]="filter.key"
                  [placeholder]="filter.placeholder || ''"
                  [(ngModel)]="filterValues[filter.key]"
                  (input)="onFilterChange()"
                />

                <!-- Input Date -->
                <input
                  *ngIf="filter.type === 'date'"
                  type="date"
                  class="form-control"
                  [id]="filter.key"
                  [(ngModel)]="filterValues[filter.key]"
                  (change)="onFilterChange()"
                />

                <!-- Select -->
                <select
                  *ngIf="filter.type === 'select'"
                  class="form-select"
                  [id]="filter.key"
                  [(ngModel)]="filterValues[filter.key]"
                  (change)="onFilterChange()"
                >
                  <option value="">Todos</option>
                  <option 
                    *ngFor="let option of filter.options" 
                    [value]="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- Ordenação -->
              <div class="col-md-6 col-lg-4" *ngIf="sortOptions.length > 0">
                <label for="sortBy" class="form-label">Ordenar por</label>
                <div class="input-group">
                  <select
                    id="sortBy"
                    class="form-select"
                    [(ngModel)]="currentSort.key"
                    (change)="onSortChange()"
                  >
                    <option value="">Padrão</option>
                    <option 
                      *ngFor="let sort of sortOptions" 
                      [value]="sort.key"
                    >
                      {{ sort.label }}
                    </option>
                  </select>
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    (click)="toggleSortDirection()"
                    [disabled]="!currentSort.key"
                  >
                    <i [class]="currentSort.direction === 'asc' ? 'bi bi-sort-alpha-down' : 'bi bi-sort-alpha-up'"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Ações dos Filtros -->
            <div class="filter-actions mt-3">
              <button 
                class="btn btn-sm btn-outline-danger me-2" 
                (click)="clearFilters()"
                *ngIf="activeFiltersCount > 0"
              >
                <i class="bi bi-x-circle"></i>
                Limpar Filtros
              </button>
              
              <button 
                class="btn btn-sm btn-outline-primary" 
                (click)="saveCurrentFilters()"
                *ngIf="activeFiltersCount > 0 && enableSavedFilters"
              >
                <i class="bi bi-bookmark"></i>
                Salvar Filtros
              </button>
            </div>

            <!-- Filtros Salvos -->
            <div class="saved-filters mt-3" *ngIf="savedFilters.length > 0 && enableSavedFilters">
              <label class="form-label">Filtros Salvos:</label>
              <div class="d-flex flex-wrap gap-2">
                <button
                  *ngFor="let saved of savedFilters"
                  class="btn btn-sm btn-outline-info"
                  (click)="applySavedFilter(saved)"
                >
                  {{ saved.name }}
                  <i class="bi bi-x ms-1" (click)="removeSavedFilter(saved); $event.stopPropagation()"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .advanced-filters {
      margin-bottom: 1.5rem;
    }

    .search-bar .input-group-text {
      background-color: #f8f9fa;
      border-right: none;
    }

    .search-bar .form-control {
      border-left: none;
      border-right: none;
    }

    .search-bar .form-control:focus {
      box-shadow: none;
      border-color: #ced4da;
    }

    .filters-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .filters-panel.show {
      max-height: 500px;
    }

    .filter-actions {
      border-top: 1px solid #dee2e6;
      padding-top: 1rem;
    }

    .btn.active {
      background-color: #0d6efd;
      color: white;
      border-color: #0d6efd;
    }

    .saved-filters .btn {
      position: relative;
    }

    .saved-filters .btn .bi-x {
      cursor: pointer;
    }

    .saved-filters .btn .bi-x:hover {
      color: #dc3545;
    }
  `]
})
export class AdvancedFiltersComponent implements OnInit {
  @Input() searchPlaceholder = 'Pesquisar...';
  @Input() filterOptions: FilterOption[] = [];
  @Input() sortOptions: SortOption[] = [];
  @Input() enableSavedFilters = true;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filtersChange = new EventEmitter<FilterValue>();
  @Output() sortChange = new EventEmitter<SortOption>();

  searchTerm = '';
  filterValues: FilterValue = {};
  currentSort: SortOption = { key: '', label: '', direction: 'asc' };
  showFilters = false;
  savedFilters: { name: string; filters: FilterValue; sort: SortOption }[] = [];

  ngOnInit() {
    this.loadSavedFilters();
  }

  get activeFiltersCount(): number {
    return Object.values(this.filterValues).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onSearchChange() {
    this.searchChange.emit(this.searchTerm);
  }

  onFilterChange() {
    this.filtersChange.emit({ ...this.filterValues });
  }

  onSortChange() {
    this.sortChange.emit({ ...this.currentSort });
  }

  toggleSortDirection() {
    this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    this.onSortChange();
  }

  clearFilters() {
    this.filterValues = {};
    this.currentSort = { key: '', label: '', direction: 'asc' };
    this.onFilterChange();
    this.onSortChange();
  }

  saveCurrentFilters() {
    const name = prompt('Nome para este conjunto de filtros:');
    if (name && name.trim()) {
      const newSavedFilter = {
        name: name.trim(),
        filters: { ...this.filterValues },
        sort: { ...this.currentSort }
      };
      this.savedFilters.push(newSavedFilter);
      this.saveSavedFilters();
    }
  }

  applySavedFilter(saved: { name: string; filters: FilterValue; sort: SortOption }) {
    this.filterValues = { ...saved.filters };
    this.currentSort = { ...saved.sort };
    this.onFilterChange();
    this.onSortChange();
  }

  removeSavedFilter(saved: { name: string; filters: FilterValue; sort: SortOption }) {
    this.savedFilters = this.savedFilters.filter(f => f !== saved);
    this.saveSavedFilters();
  }

  private loadSavedFilters() {
    const saved = localStorage.getItem('advanced-filters-saved');
    if (saved) {
      try {
        this.savedFilters = JSON.parse(saved);
      } catch (e) {
        this.savedFilters = [];
      }
    }
  }

  private saveSavedFilters() {
    localStorage.setItem('advanced-filters-saved', JSON.stringify(this.savedFilters));
  }
}
