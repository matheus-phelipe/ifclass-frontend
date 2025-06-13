import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Login } from '../../model/usuario/login.model';
import { UsuarioService } from '../../service/usuario/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  credenciais: Login = {
    email: '',
    senha:''
  };

  constructor(private service: UsuarioService, private router: Router) {}

  login(){
    this.service.logar(this.credenciais.email, this.credenciais.senha).subscribe({
      next: () => {
        alert('Login feito com sucesso!');
        this.router.navigate(['/home']);
      },
      error: (err) =>{
        alert('Email e/ou senha incorretos!');
      }
    });
  }

}
