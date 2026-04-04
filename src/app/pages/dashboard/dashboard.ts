import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
// 1. Importamos el servicio
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,      
    RouterLink,        
    RouterLinkActive   
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  
  // 2. Inyectamos el servicio en el constructor
  constructor(private authService: AuthService) {}

  // 3. Creamos la función que llamará tu botón en el HTML
  cerrarSesion() {
    // Si sale esta alerta, ¡hemos resucitado el botón!
    alert('🔥 DASHBOARD: ¡El botón funciona y me llamó!');
    this.authService.logout();
  }
}