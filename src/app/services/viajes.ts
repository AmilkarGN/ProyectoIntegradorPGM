import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViajesService {
  
  // Aquí pondrás la URL real de tu Backend cuando lo tengas listo (ej. Laravel, Node, Spring)
  private apiUrl = 'http://localhost:3000/api/viajes'; 

  constructor(private http: HttpClient) { }

  // Esta función recibe los datos del mapa y hace el POST a tu base de datos
  registrarNuevoViaje(datosViaje: any): Observable<any> {
    return this.http.post(this.apiUrl, datosViaje);
  }
}