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

  // Lista de rotas onde a sidebar NÃO deve aparecer.
  private standaloneRoutes = ['/login', '/cadastro'];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Verifica a URL inicial de forma síncrona
    this.updateLayout(this.router.url);
  }

  ngOnInit(): void {
    // Escuta as mudanças de rota para atualizar o layout
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateLayout(event.urlAfterRedirects);
    });
  }

  private updateLayout(currentUrl: string): void {
    // Verifica se a URL atual está na lista de rotas standalone.
    // O método `some` retorna true se pelo menos uma rota da lista for encontrada na URL.
    this.showMainLayout = !this.standaloneRoutes.some(route => currentUrl.includes(route));
    
    // Se for para mostrar o layout, verifica as permissões.
    if (this.showMainLayout) {
      this.checkUserRoles();
    }
  }

  private checkUserRoles(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isProfessor = this.authService.hasRole('ROLE_PROFESSOR');
    this.isCoordenador = this.authService.hasRole('ROLE_COORDENADOR');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}