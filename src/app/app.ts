import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './service/auth/auth.service';
import { UsuarioService } from './service/usuario/usuario.service';
import { LoaderService } from './shared/loader/loader.service';
import { SidebarComponent } from './shared/sidebar/sidebar';
import { LoaderComponent } from './shared/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    SidebarComponent,
    LoaderComponent
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
  private standaloneRoutes = ['/login', '/cadastro', '/resetar-senha', '/aluno/mapa'];
  private roleSubscription!: Subscription;

  get loaderVisible$() {
    return this.loaderService.loading$;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private loaderService: LoaderService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {
    this.updateLayout(this.router.url);
  }

  ngOnInit(): void {
    // Escuta as mudanças de rota para ATUALIZAR O LAYOUT (mostrar/esconder sidebar)
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateLayoutVisibility(event.urlAfterRedirects);
      this.cdr.detectChanges();
    });

    // Escuta as mudanças de PERFIL ATIVO para ATUALIZAR AS PERMISSÕES DA SIDEBAR
    this.roleSubscription = this.authService.activeRole$.subscribe(() => {
      this.checkUserRoles();
      this.cdr.detectChanges();
    });

    // Verificações iniciais
    this.updateLayoutVisibility(this.router.url);
    this.checkUserRoles();
  }

  ngOnDestroy(): void {
    // Boa prática: remove a inscrição ao destruir o componente
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  private updateLayoutVisibility(currentUrl: string): void {
    this.showMainLayout = !this.standaloneRoutes.some(route => currentUrl.includes(route));
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
    this.isAdmin = this.authService.isRoleActiveOrHigher('ROLE_ADMIN');
    this.isProfessor = this.authService.isRoleActiveOrHigher('ROLE_PROFESSOR');
    this.isCoordenador = this.authService.isRoleActiveOrHigher('ROLE_COORDENADOR');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}