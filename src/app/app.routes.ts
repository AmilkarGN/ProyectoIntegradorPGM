import { Routes } from '@angular/router';

// 1. Auth (Carpeta auth/login)
import { Login } from './auth/login/login'; 

// 2. Dashboard (Carpeta pages/dashboard)
import { Dashboard } from './pages/dashboard/dashboard'; 

// 3. Páginas Hijas (Rutas directas a los archivos .ts)
import { Inicio } from './pages/inicio/inicio';
import { MapaVivo } from './pages/mapa-vivo/mapa-vivo';
import { MapaCalor } from './pages/mapa-calor/mapa-calor';
import { VisorCarga } from './pages/visor-carga/visor-carga';
import { CalendarioLogistico } from './pages/calendario-logistico/calendario-logistico';

export const routes: Routes = [
  { path: 'login', component: Login },
  { 
    path: 'dashboard', 
    component: Dashboard,
    children: [
      { path: 'inicio', component: Inicio },
      { path: 'mapa', component: MapaVivo },
      { path: 'calor', component: MapaCalor },
      { path: 'visor-carga', component: VisorCarga },
      { path: 'calendario', component: CalendarioLogistico },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];