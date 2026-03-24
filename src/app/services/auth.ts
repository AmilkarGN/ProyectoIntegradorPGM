import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // La dirección de tu servidor Django (Prueba de Vida)
  private apiUrl = 'http://127.0.0.1:8000/api/login/';

  constructor(private http: HttpClient) { }

  // Función para enviar los datos de login
  login(credentials: {username: string, password: string}): Observable<any> {
    return this.http.post(this.apiUrl, credentials);
  }
}