import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs'; // CORRIGIDO: Importação para RxJS v7+
import { SidebarComponent } from './shared/sidebar/sidebar';
import { AuthService } from './service/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    SidebarComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'ifclass-frontend';

  isAdmin = false;
  isProfessor = false;
  isCoordenador = false;
  showMainLayout = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // **CORREÇÃO APLICADA AQUI**
    // Definimos o estado inicial do layout imediatamente com base na URL atual.
    // Isso garante que a página de login seja exibida corretamente na primeira carga.
    this.showMainLayout = !this.router.url.includes('/login');
  }

  ngOnInit(): void {
    // A assinatura continua sendo necessária para reagir a navegações futuras.
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Atualiza o layout com base na nova URL após cada navegação.
      this.showMainLayout = !event.urlAfterRedirects.includes('/login');
      
      if (this.showMainLayout) {
        this.checkUserRoles();
      }
    });
  }

  checkUserRoles(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isProfessor = this.authService.hasRole('ROLE_PROFESSOR');
    this.isCoordenador = this.authService.hasRole('ROLE_COORDENADOR');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}