import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  // Este componente PADRE ahora está limpio. 
  // Solo sirve para mostrar el Sidebar y cargar las páginas hijas en el <router-outlet>
}