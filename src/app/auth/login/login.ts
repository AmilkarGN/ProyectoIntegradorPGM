import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  // Es muy importante importar RouterLink y ReactiveFormsModule aquí
  imports: [RouterLink, ReactiveFormsModule], 
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Definimos la estructura y validaciones del formulario
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  // Esta función se ejecutará al hacer clic en "Ingresar"
  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Listo para enviar al Backend:', this.loginForm.value);
      // En el siguiente paso aquí conectaremos con Django
    } else {
      console.log('El formulario no es válido');
    }
  }
}