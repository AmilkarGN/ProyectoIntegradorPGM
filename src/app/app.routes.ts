import { Routes } from '@angular/router';
// 1. Importamos la Landing (Página de la empresa) y Auth
import { Landing } from './pages/landing/landing'; 
import { Login } from './auth/login/login'; 
import { Register } from './auth/register/register'; // Asumiendo que ya creaste auth/register/register.ts
import { authGuard } from './guards/auth-guard';
// 2. Dashboard
import { Dashboard } from './pages/dashboard/dashboard'; 

// 3. Páginas Hijas 
import { Inicio } from './pages/inicio/inicio';
import { MapaVivo } from './pages/mapa-vivo/mapa-vivo';
import { MapaCalor } from './pages/mapa-calor/mapa-calor';
import { VisorCarga } from './pages/visor-carga/visor-carga';
import { CalendarioLogistico } from './pages/calendario-logistico/calendario-logistico';
import { CiudadesComponent } from './pages/ciudades/ciudades';    

export const routes: Routes = [
  // 🚀 CAMBIO PRINCIPAL: La ruta vacía ahora muestra la Landing
  { path: '', component: Landing, pathMatch: 'full' }, 

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: 'inicio', component: Inicio },
      { path: 'mapa', component: MapaVivo },
      { path: 'calor', component: MapaCalor },
      { path: 'visor-carga', component: VisorCarga },
      { path: 'calendario', component: CalendarioLogistico },
      { path: 'ciudades', component: CiudadesComponent },
      
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  
  // Si alguien escribe una URL que no existe, lo mandamos al inicio (Landing)
  { path: '**', redirectTo: '/login' }
];
