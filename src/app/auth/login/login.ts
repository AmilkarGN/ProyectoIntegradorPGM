import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router'; // Importar Router
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  private router = inject(Router); // Inyectar el servicio de rutas

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login exitoso (Simulado)');
      this.router.navigate(['/dashboard']); // Redirección con animación
    }
  }
}