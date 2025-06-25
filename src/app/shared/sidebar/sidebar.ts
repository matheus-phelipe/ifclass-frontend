import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true, // ✅ Standalone
  imports: [CommonModule, RouterModule], // ✅ Importa CommonModule + RouterModule
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() isProfessor: boolean = false;
  @Input() isCoordenador: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() isMobile: boolean = false;
  @Input() sidebarCollapsed: boolean = false;

  @Output() sidebarToggled = new EventEmitter<void>();

  // Estados dos submenus
  expandedMenus: { [key: string]: boolean } = {
    geral: true,
    coordenacao: false,
    admin: false
  };

  constructor(
    private router: Router,
    private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarToggled.emit();
  }

  toggleSubmenu(menuKey: string) {
    if (!this.sidebarCollapsed) {
      this.expandedMenus[menuKey] = !this.expandedMenus[menuKey];
    }
  }

  logout() {
    this.authService.logout();
  }
}
