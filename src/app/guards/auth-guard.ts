import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. ¿Estamos en el navegador (Chrome, Edge)?
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('transkelion_token');

    if (token) {
      return true; // Tiene token, ¡lo dejamos pasar!
    } else {
      router.navigate(['/login']); // NO tiene token, patada al login
      return false;
    }
  }

  // 2. ¿Estamos en el servidor de Angular (cuando presionas F5)?
  // Le decimos que "sí" para que no interrumpa la recarga.
  // El navegador tomará el control inmediatamente después.
  return true; 
};