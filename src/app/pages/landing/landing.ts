import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Importa esto

@Component({
  selector: 'app-landing',
  standalone: true, // Asegúrate de que diga true
  imports: [RouterLink], // Agrégalo aquí
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {}