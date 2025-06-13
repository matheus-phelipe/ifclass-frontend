import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router, private authService: AuthService) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
