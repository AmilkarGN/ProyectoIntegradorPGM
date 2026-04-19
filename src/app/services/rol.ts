import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rol {
  id?: number; // <-- Lo hacemos opcional con el signo de interrogación
  nombre_rol: string; 
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = 'http://localhost:8000/api/roles/';

  constructor(private http: HttpClient) { }

  obtenerRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  crearRol(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  actualizarRol(id: number, rol: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}${id}/`, rol);
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}