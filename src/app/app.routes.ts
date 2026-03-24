import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Dashboard } from './pages/dashboard/dashboard'; // Importamos el dashboard

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard }, // Nueva ruta del panel
  { path: '**', redirectTo: '' }
];