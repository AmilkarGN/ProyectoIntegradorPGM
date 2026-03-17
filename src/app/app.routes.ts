import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  { path: '', component: LandingComponent }, // Ruta principal (Front)
  { path: 'login', component: LoginComponent }, // Ruta del Login
  { path: '**', redirectTo: '' } // Si escriben una URL que no existe, los devuelve al Front
];