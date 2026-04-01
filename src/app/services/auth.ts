import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // La dirección de tu servidor Django (Prueba de Vida)
  private apiUrl = 'http://127.0.0.1:8000/api/login/';

  constructor(private http: HttpClient) { }

  // Función para enviar los datos de login
  
  // ... tus importaciones ...

  // 1. Modificamos el login para que NO guarde tokens todavía, solo devuelva la respuesta
  login(credenciales: any) {
    return this.http.post<any>('http://127.0.0.1:8000/api/login/', credenciales);
  }

  // 2. NUEVA FUNCIÓN: Para enviar el código de 6 dígitos
  verificar2FA(datos: {username: string, codigo: string}) {
    return this.http.post<any>('http://127.0.0.1:8000/api/verificar-2fa/', datos);
  }

  // 3. NUEVA FUNCIÓN: El cerebro de "Recordar Dispositivo"
  guardarSesion(tokens: any, user: any, recordar: boolean) {
    // Si recordar es True, usamos localStorage (permanente). Si es False, sessionStorage (se borra al cerrar la pestaña)
    const storage = recordar ? localStorage : sessionStorage;
    
    storage.setItem('transkelion_token', tokens.access);
    storage.setItem('transkelion_user', JSON.stringify(user));
    
    if (recordar) {
      // Solo guardamos el token de 30 días si es un dispositivo de confianza
      localStorage.setItem('transkelion_refresh', tokens.refresh);
    }
  }}

