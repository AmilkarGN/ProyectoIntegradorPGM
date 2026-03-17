import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register'; // Verifica que esta ruta sea exacta

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register }, // Esta es la ruta para el botón
  { path: '**', redirectTo: '' }
];