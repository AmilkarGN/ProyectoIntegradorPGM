import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps'; // 🔥 ¡IMPORTANTE! GoogleMap añadido aquí
import { ViajesService } from '../../services/viajes';

@Component({
  selector: 'app-mapa-vivo',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule],
  templateUrl: './mapa-vivo.html',
  styleUrls: ['./mapa-vivo.css']
})
export class MapaVivo implements OnInit, AfterViewInit {
  
  // 🔥 EL OJO DE ANGULAR: Esto es lo que faltaba para encontrar el mapa
  @ViewChild(GoogleMap, { static: false }) mapaComponente!: GoogleMap;
  
  @ViewChild('origenInput') origenInput!: ElementRef;
  @ViewChild('destinoInput') destinoInput!: ElementRef;

  center: any = { lat: -16.5000, lng: -68.1500 }; 
  zoom = 14;
  mapOptions: any = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false
  };

  directionsService: any;
  directionsRenderer: any;
  geocoder: any;

  markerStart: any = null;
  markerEnd: any = null;
  markerUbicacion: any = null; // Para el puntito azul

  distanciaReal = '';
  tiempoReal = '';
  origenSelec = '';
  destinoSelec = '';
  rutaCalculada = false;
  cargandoUbicacion = false;
  
  
  isBrowser: boolean;

  constructor(
    private ngZone: NgZone, 
    private viajesService: ViajesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) this.chequearGoogleYServicios();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        this.chequearGoogleYServicios();
        if (typeof window !== 'undefined' && (window as any).google && this.origenInput) {
          this.iniciarAutocompletado(this.origenInput.nativeElement, 'origen');
          this.iniciarAutocompletado(this.destinoInput.nativeElement, 'destino');
        }
      }, 1000);
    }
  }

  chequearGoogleYServicios() {
    if (typeof window !== 'undefined' && (window as any).google && !this.directionsService) {
      const g = (window as any).google.maps;
      this.directionsService = new g.DirectionsService();
      this.geocoder = new g.Geocoder();
      this.directionsRenderer = new g.DirectionsRenderer({
        suppressMarkers: true, 
        polylineOptions: { strokeColor: '#FF6600', strokeWeight: 7, strokeOpacity: 0.9 }
      });
    }
  }

  // ==========================================
  // DIBUJO DE ICONOS (REACTIVIDAD INMEDIATA)
  // ==========================================

  dibujarPuntitoAzul(coords: any) {
    // 🔥 Buscamos el mapa real de Angular
    const mapaReal = this.mapaComponente?.googleMap;
    if (!mapaReal) return;

    const g = (window as any).google.maps;
    if (this.markerUbicacion) this.markerUbicacion.setMap(null);

    // Creamos el círculo azul clásico de Google
    this.markerUbicacion = new g.Marker({
      position: coords,
      map: mapaReal, // Lo pegamos al mapa
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'Tu Ubicación Actual'
    });
  }

  dibujarMarcadorInmediato(posicionLatLng: any, tipo: 'origen' | 'destino') {
    const mapaReal = this.mapaComponente?.googleMap;
    if (!mapaReal) return;

    const g = (window as any).google.maps;
    if (tipo === 'origen') {
      if (this.markerStart) this.markerStart.setMap(null);
      this.markerStart = new g.Marker({
        position: posicionLatLng,
        map: mapaReal,
        label: { text: '🚛', fontSize: '28px' },
        animation: g.Animation.DROP
      });
    } else {
      if (this.markerEnd) this.markerEnd.setMap(null);
      this.markerEnd = new g.Marker({
        position: posicionLatLng,
        map: mapaReal,
        label: { text: '🏁', fontSize: '28px' },
        animation: g.Animation.DROP
      });
    }
  }

  // ==========================================
  // INTERACCIÓN
  // ==========================================

  obtenerMiUbicacion() {
    if (!this.isBrowser || !navigator.geolocation || typeof window === 'undefined' || !(window as any).google) return;
    
    const mapaReal = this.mapaComponente?.googleMap;
    if (!mapaReal) {
      alert('El mapa aún se está cargando, inténtalo de nuevo en un segundo.');
      return;
    }

    this.cargandoUbicacion = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        
        mapaReal.setCenter(coords);
        mapaReal.setZoom(17);
        
        // Dibuja el puntito azul y el camión de inmediato
        this.dibujarPuntitoAzul(coords);
        this.dibujarMarcadorInmediato(coords, 'origen');

        this.geocoder.geocode({ location: coords }, (results: any, status: any) => {
          this.ngZone.run(() => {
            this.cargandoUbicacion = false;
            if (status === 'OK' && results?.[0]) {
              this.origenSelec = results[0].formatted_address;
              this.origenInput.nativeElement.value = this.origenSelec;
            }
          });
        });
      },
      (error) => {
        this.ngZone.run(() => this.cargandoUbicacion = false);
        alert('No se pudo acceder a tu ubicación.');
      }
    );
  }

  onMapClick(event: any) {
    if (!this.isBrowser || !event.latLng || typeof window === 'undefined' || !(window as any).google) return;

    this.geocoder.geocode({ location: event.latLng }, (results: any, status: any) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results?.[0]) {
          const direccion = results[0].formatted_address;
          
          if (!this.origenSelec) {
            this.origenSelec = direccion;
            this.origenInput.nativeElement.value = direccion;
            this.dibujarMarcadorInmediato(event.latLng, 'origen');
          } else {
            this.destinoSelec = direccion;
            this.destinoInput.nativeElement.value = direccion;
            this.dibujarMarcadorInmediato(event.latLng, 'destino');
            this.calcularRutaVisual();
          }
        }
      });
    });
  }

  iniciarAutocompletado(inputElement: HTMLInputElement, tipo: 'origen' | 'destino') {
    try {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(inputElement);
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = autocomplete.getPlace();
          if (tipo === 'origen') {
            this.origenSelec = place.formatted_address || '';
            if (place.geometry?.location) this.dibujarMarcadorInmediato(place.geometry.location, 'origen');
          } else {
            this.destinoSelec = place.formatted_address || '';
            if (place.geometry?.location) this.dibujarMarcadorInmediato(place.geometry.location, 'destino');
          }
          this.rutaCalculada = false;
        });
      });
    } catch (e) { console.warn("Autocompletado bloqueado."); }
  }

  // ==========================================
  // LÓGICA DE RUTA Y BACKEND
  // ==========================================

  calcularRutaVisual() {
    if (!this.isBrowser || !this.origenSelec || !this.destinoSelec || typeof window === 'undefined' || !(window as any).google) return;
    
    this.chequearGoogleYServicios();
    const mapaReal = this.mapaComponente?.googleMap;
    if (!mapaReal) return;

    // Conecta la línea naranja al mapa real
    this.directionsRenderer.setMap(mapaReal);

    const g = (window as any).google.maps;
    const request = {
      origin: this.origenSelec,
      destination: this.destinoSelec,
      travelMode: g.TravelMode.DRIVING
    };

    this.directionsService.route(request, (response: any, status: any) => {
      if (status === 'OK' && response) {
        this.ngZone.run(() => {
          this.directionsRenderer.setDirections(response);
          const leg = response.routes[0].legs[0];
          this.distanciaReal = leg.distance.text;
          this.tiempoReal = leg.duration.text;
          this.rutaCalculada = true;

          // Asegura que los marcadores queden encima de la ruta calculada
          this.dibujarMarcadorInmediato(leg.start_location, 'origen');
          this.dibujarMarcadorInmediato(leg.end_location, 'destino');
        });
      } else {
        alert('No pudimos trazar una ruta conduciendo entre esos dos puntos.');
      }
    });
  }

  guardarViajeEnBackend() {
    const datos = {
      origen: this.origenSelec,
      destino: this.destinoSelec,
      distancia: this.distanciaReal,
      tiempo: this.tiempoReal
    };
    this.viajesService.registrarNuevoViaje(datos).subscribe({
      next: () => {
        alert('¡Ruta guardada exitosamente!');
        this.limpiarMapa();
      },
      error: () => alert('Simulación: El viaje ha sido capturado.')
    });
  }

  limpiarMapa() {
    this.origenSelec = '';
    this.destinoSelec = '';
    if (this.origenInput) this.origenInput.nativeElement.value = '';
    if (this.destinoInput) this.destinoInput.nativeElement.value = '';

    if (this.isBrowser && typeof window !== 'undefined' && (window as any).google) {
      this.directionsRenderer.setDirections({ routes: [] } as any);
    }

    if (this.markerStart) this.markerStart.setMap(null);
    if (this.markerEnd) this.markerEnd.setMap(null);
    if (this.markerUbicacion) this.markerUbicacion.setMap(null);

    this.rutaCalculada = false;
  }
}