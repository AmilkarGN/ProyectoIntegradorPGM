import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // IMPORTANTE EL RouterLink
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Agregarlo aquí también
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
// ... tus importaciones ...

export class Login {
  username = '';
  password = '';
  necesita2FA = false;
  codigo2FA = '';
  recordarDispositivo = false;
  verContrasena = false;
  
  // NUEVO: Variable para controlar la ruedita de carga
  cargando = false; 

  constructor(private authService: AuthService, private router: Router) {}

  toggleContrasena() { this.verContrasena = !this.verContrasena; }

  iniciarSesion() {
    // NUEVO: Activamos el loader antes de enviar la petición
    this.cargando = true; 

    const credenciales = { username: this.username, password: this.password };
    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {
        this.cargando = false; // NUEVO: Lo apagamos si fue exitoso
        if (respuesta.status === 'pending_2fa') { 
          this.necesita2FA = true; 
        }
      },
      error: (err: any) => {
        this.cargando = false; // NUEVO: Lo apagamos si hubo error
        alert('Credenciales incorrectas');
      }
    });
  }

  verificarCodigo() {
    this.cargando = true; // NUEVO: También para la verificación 2FA

    const datos = { username: this.username, codigo: this.codigo2FA };
    this.authService.verificar2FA(datos).subscribe({
      next: (respuesta) => {
        this.cargando = false; // NUEVO: Apagar al terminar
        if (respuesta.status === 'success') {
          this.authService.guardarSesion(respuesta.tokens, respuesta.user, this.recordarDispositivo);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => {
        this.cargando = false; // NUEVO: Apagar en error
        alert('Código incorrecto o caducado');
      }
    });
  }
}