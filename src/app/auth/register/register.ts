import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Asegúrate de que esté aquí
import { CommonModule } from '@angular/common'; // Asegúrate de que esté aquí para *ngIf si lo usas
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['../login/login.css'] // <-- Apunta al CSS del login como acordamos
})
export class Register {
  
  // Variables de UI para los ojos de contraseña
  verContrasena = false;
  verConfirmarContrasena = false; // <-- Control independiente para el segundo ojo

  constructor() {}

  toggleContrasena() {
    this.verContrasena = !this.verContrasena;
  }

  toggleConfirmarContrasena() {
    this.verConfirmarContrasena = !this.verConfirmarContrasena;
  }
}