import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event) => {
        if (event.key === 'transkelion_token' && event.newValue === null) {
          console.warn('Cierre de sesión detectado en otra pestaña. Protegiendo sistema...');
          this.ngZone.run(() => {
            this.router.navigate(['/login']);
          });
        }
      });
    }
  }

  // --- 👇 AQUÍ ESTÁ LA NUEVA FUNCIÓN 👇 ---
  guardarSesion(tokens: any, user: any, recordarDispositivo: boolean) {
    console.log('📦 SERVICIO: Intentando escribir en el disco duro...');
    
    // Lo guardamos a la fuerza, sin el "if", porque un clic siempre es en el navegador
    localStorage.setItem('transkelion_token', tokens.access);
    localStorage.setItem('transkelion_refresh', tokens.refresh);
    localStorage.setItem('transkelion_user', JSON.stringify(user));

    console.log('📦 SERVICIO: ¡Escritura confirmada! El disco duro tiene:', localStorage.getItem('transkelion_token'));
  }
  // ----------------------------------------

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      // Borramos todo rastro de la sesión
      localStorage.removeItem('transkelion_token');
      localStorage.removeItem('transkelion_refresh');
      localStorage.removeItem('transkelion_user');
    }
    this.router.navigate(['/login']);
  }
}