import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth'; // Asegúrate de que la ruta sea correcta
import { CommonModule } from '@angular/common'; // Para usar @if o ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService); // Inyectamos tu nuevo servicio

  errorMessage: string = ''; // Para mostrar errores en el HTML

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  onSubmit() {
    if (this.loginForm.valid) {
      // Obtenemos los datos del formulario
      const credentials = {
        username: this.loginForm.value.username!,
        password: this.loginForm.value.password!
      };

      // Llamada real al Backend (Django + Postgres)
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          // Si Django responde OK, guardamos el nombre (opcional) y redirigimos
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error en el login:', error);
          this.errorMessage = 'Usuario o contraseña incorrectos. Intenta de nuevo.';
        }
      });
    }
  }
}