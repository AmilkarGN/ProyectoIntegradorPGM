import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // Variables del formulario normal
  username = '';
  password = '';
  
  // Variables para la Fase 2 (2FA y Recordar)
  necesita2FA = false;
  codigo2FA = '';
  recordarDispositivo = false;

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion() {
    const credenciales = { username: this.username, password: this.password };
    
    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {
        if (respuesta.status === 'pending_2fa') {
          // ¡Éxito en fase 1! Ocultamos el login y mostramos la caja del código
          this.necesita2FA = true;
        }
      },
      error: (err) => alert('Credenciales incorrectas')
    });
  }

  verificarCodigo() {
    const datos = { username: this.username, codigo: this.codigo2FA };

    this.authService.verificar2FA(datos).subscribe({
      next: (respuesta) => {
        if (respuesta.status === 'success') {
          // ¡Código correcto! Guardamos la sesión dependiendo de la casilla
          this.authService.guardarSesion(respuesta.tokens, respuesta.user, this.recordarDispositivo);
          // ¡Ahora sí, abrimos la puerta al Dashboard!
          this.router.navigate(['/dashboard']);
        }
      },

      error: (err: any) => alert('Credenciales incorrectas')
    });
  }
}