import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';
import { ALL_MENU_CARDS, MenuCard } from './menu-cards';
import { SidebarComponent } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit{
  constructor(private router: Router, private authService: AuthService) {}

  sidebarOpen = true;

   menuCards: MenuCard[] = [];

  ngOnInit(): void {
    this.menuCards = ALL_MENU_CARDS.filter(card =>
      card.roles.some(role => this.authService.hasRole(role))
    );
  }

  get isAdmin() { return this.authService.hasRole('ROLE_ADMIN'); }
  get isCoordenador() { return this.authService.hasRole('ROLE_COORDENADOR'); }
  get isProfessor() { return this.authService.hasRole('ROLE_PROFESSOR'); }
  get isAluno() { return this.authService.hasRole('ROLE_ALUNO'); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
