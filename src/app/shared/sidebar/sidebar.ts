import { Component, Input } from '@angular/core';
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

  sidebarOpen: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
