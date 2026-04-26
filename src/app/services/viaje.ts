import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // --- MAESTROS ---
  obtenerAsignacionesActivas(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/asignaciones/?activas=true`); }
  obtenerEstadosViaje(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/estados-viaje/`); }
  obtenerRutas(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/rutas/`); }
  obtenerReservasPendientes(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/reservas/`); }

  // --- MAPA VIVO Y RUTAS (¡Aquí está el que faltaba!) ---
  crearRuta(datosRuta: any): Observable<any> { 
    return this.http.post(`${this.apiUrl}/rutas/`, datosRuta); 
  }

  // --- VIAJES ---
  obtenerViajes(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/viajes/`); }
  crearViaje(datos: any): Observable<any> { return this.http.post(`${this.apiUrl}/viajes/`, datos); }
  actualizarEstadoViaje(codigo: string, datos: any): Observable<any> { return this.http.patch(`${this.apiUrl}/viajes/${codigo}/`, datos); }

  // --- VIÁTICOS ---
  crearViatico(datos: any): Observable<any> { return this.http.post(`${this.apiUrl}/viaticos/`, datos); }
  pagarViatico(id: number, datos: any): Observable<any> { return this.http.patch(`${this.apiUrl}/viaticos/${id}/`, datos); }
}