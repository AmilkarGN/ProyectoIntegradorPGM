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
    this.cargando = true; 
    const datos = { username: this.username, codigo: this.codigo2FA };
    
    console.log('🟡 1. Enviando código a Django...');

    this.authService.verificar2FA(datos).subscribe({
      next: (respuesta) => {
        console.log('🟢 2. Django respondió OK:', respuesta);
        this.cargando = false; 
        
       if (respuesta.status === 'success') {
          try {
            console.log('🟡 3. Guardando token DIRECTAMENTE desde el Login...');
            
            // 1. Guardamos la sesión directo a la memoria, sin usar el servicio
            localStorage.setItem('transkelion_token', respuesta.tokens.access);
            localStorage.setItem('transkelion_refresh', respuesta.tokens.refresh);
            localStorage.setItem('transkelion_user', JSON.stringify(respuesta.user));
            
            console.log('🟢 4. ¡Token escrito! Revisando el bolsillo ahora mismo:', localStorage.getItem('transkelion_token'));
            
            // 2. Le damos un mini respiro de 50ms al disco duro y viajamos
            setTimeout(() => {
              this.router.navigate(['/dashboard']).then(pudoEntrar => {
                if (pudoEntrar) {
                  console.log('✅ 5. ¡Bienvenido al Dashboard!');
                } else {
                  console.error('🚨 5. ERROR: El Guardia lo bloqueó de nuevo.');
                }
              });
            }, 50);

          } catch (errorGuardar) {
            console.error('🚨 ERROR FATAL AL GUARDAR SESIÓN:', errorGuardar);
          }
        }
      },
      error: (err: any) => {
        console.error('🔴 Error del backend en intento 2FA:', err);
        this.cargando = false; 
        alert('Código incorrecto o caducado');
      }
    });
  }
}