import { Component, OnInit, ViewChild, NgZone, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { ViajeService } from '../../services/viaje';

@Component({
  selector: 'app-mapa-vivo',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './mapa-vivo.html',
  styleUrls: ['./mapa-vivo.css']
})
export class MapaVivo implements OnInit, OnDestroy {
  @ViewChild(GoogleMap, { static: false }) mapaComponente!: GoogleMap;
  
  center: any = { lat: -16.5000, lng: -68.1500 }; 
  zoom = 12;
  mapOptions: any = { mapTypeId: 'roadmap', disableDefaultUI: false };

  isBrowser: boolean;
  viajesActivos: any[] = [];
  marcadoresCamiones: { [codigo: string]: any } = {};
  intervaloActualizacion: any;

  viajeSeleccionado: any = null;
  alertaDesvio: string | null = null;
  directionsService: any;
  directionsRenderer: any;
  primeraCarga = true;

  // --- VARIABLES DEL SIMULADOR ---
  rutaPath: any[] = []; // Guardará todos los puntos de la carretera
  simulacionInterval: any = null;
  simulacionActiva = false;
  pasoSimulacion = 0;

  constructor(private ngZone: NgZone, private viajeService: ViajeService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.cargarFlotaEnVivo();
      // El mapa pide coordenadas nuevas cada 5 segundos para que se vea fluido
      this.intervaloActualizacion = setInterval(() => this.cargarFlotaEnVivo(), 5000);
    }
  }

  ngOnDestroy() {
    if (this.intervaloActualizacion) clearInterval(this.intervaloActualizacion);
    this.detenerSimulacion(); // Apagamos el simulador al salir
  }

  chequearGoogleServicios() {
    const mapaReal = this.mapaComponente?.googleMap;
    if (typeof window !== 'undefined' && (window as any).google && mapaReal && !this.directionsService) {
      const g = (window as any).google.maps;
      this.directionsService = new g.DirectionsService();
      this.directionsRenderer = new g.DirectionsRenderer({
        map: mapaReal,
        suppressMarkers: false, 
        polylineOptions: { strokeColor: '#10b981', strokeWeight: 6, strokeOpacity: 0.8 }
      });
    }
  }

  cargarFlotaEnVivo() {
    this.viajeService.obtenerViajes().subscribe(viajes => {
      this.viajesActivos = viajes.filter((v: any) => v.estado_nombre === 'En Curso' && v.latitud_actual && v.longitud_actual);
      this.actualizarMarcadoresEnMapa();

      if (this.viajeSeleccionado && !this.simulacionActiva) {
        const viajeActualizado = this.viajesActivos.find(v => v.codigo_viaje === this.viajeSeleccionado.codigo_viaje);
        if (viajeActualizado) this.validarDesvioDeRuta(viajeActualizado);
      }
    });
  }

  actualizarMarcadoresEnMapa() {
    const mapaReal = this.mapaComponente?.googleMap;
    if (!mapaReal) return;
    const g = (window as any).google.maps;
    const bounds = new g.LatLngBounds(); 

    this.viajesActivos.forEach(viaje => {
      const coords = { lat: parseFloat(viaje.latitud_actual), lng: parseFloat(viaje.longitud_actual) };
      bounds.extend(coords); 

      if (this.marcadoresCamiones[viaje.codigo_viaje]) {
        this.marcadoresCamiones[viaje.codigo_viaje].setPosition(coords);
        const icon = this.marcadoresCamiones[viaje.codigo_viaje].getIcon();
        icon.rotation = parseFloat(viaje.rumbo_actual || 0);
        this.marcadoresCamiones[viaje.codigo_viaje].setIcon(icon);
      } else {
        this.marcadoresCamiones[viaje.codigo_viaje] = new g.Marker({
          position: coords,
          map: mapaReal,
          icon: {
            path: g.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 7, fillColor: '#3b82f6', fillOpacity: 1, strokeWeight: 2, strokeColor: '#ffffff',
            rotation: parseFloat(viaje.rumbo_actual || 0)
          },
          title: `🚚 ${viaje.vehiculo_placa}`,
          zIndex: 999
        });
      }
    });

    if (this.primeraCarga && this.viajesActivos.length > 0) {
      mapaReal.fitBounds(bounds);
      this.primeraCarga = false;
    }

    const codigosActivos = this.viajesActivos.map(v => v.codigo_viaje);
    for (const codigo in this.marcadoresCamiones) {
      if (!codigosActivos.includes(codigo)) {
        this.marcadoresCamiones[codigo].setMap(null);
        delete this.marcadoresCamiones[codigo];
      }
    }
  }

  enfocarCamion(viaje: any) {
    // Si cambiamos de camión, detenemos la simulación actual
    if (this.viajeSeleccionado?.codigo_viaje !== viaje.codigo_viaje) {
      this.detenerSimulacion(); 
    }

    this.viajeSeleccionado = viaje;
    this.alertaDesvio = null; 
    this.chequearGoogleServicios();

    const mapaReal = this.mapaComponente?.googleMap;
    if (!mapaReal) return;

    const truckCoords = { lat: parseFloat(viaje.latitud_actual), lng: parseFloat(viaje.longitud_actual) };
    mapaReal.setCenter(truckCoords);
    mapaReal.setZoom(15);
    this.resaltarCamionSeleccionado(viaje.codigo_viaje);

    if (viaje.reservas_detalle && viaje.reservas_detalle.length > 0) {
      const reservaBase = viaje.reservas_detalle[0];
      const originLatLng = { lat: parseFloat(reservaBase.latitud_origen), lng: parseFloat(reservaBase.longitud_origen) };
      const destLatLng = { lat: parseFloat(reservaBase.latitud_destino), lng: parseFloat(reservaBase.longitud_destino) };

      const request = {
        origin: reservaBase.latitud_origen ? originLatLng : reservaBase.direccion_origen,
        destination: reservaBase.latitud_destino ? destLatLng : reservaBase.direccion_destino,
        travelMode: (window as any).google.maps.TravelMode.DRIVING
      };

      this.directionsService.route(request, (response: any, status: any) => {
        this.ngZone.run(() => {
          if (status === 'OK') {
            this.directionsRenderer.setDirections(response);
            
            // 🔥 GUARDAMOS EL CAMINO PARA EL SIMULADOR 🔥
            this.rutaPath = response.routes[0].overview_path;
            
            this.validarDesvioDeRuta(viaje); 
          } else {
            this.directionsRenderer.setDirections({ routes: [] });
            this.rutaPath = [];
          }
        });
      });
    }
  }

  validarDesvioDeRuta(viaje: any) {
    if (!this.directionsRenderer?.getDirections()) return;
    const g = (window as any).google.maps;
    const rutaBounds = this.directionsRenderer.getDirections().routes[0].bounds;
    const posActual = new g.LatLng(parseFloat(viaje.latitud_actual), parseFloat(viaje.longitud_actual));

    const toleranciaBounds = new g.LatLngBounds(
      new g.LatLng(rutaBounds.getSouthWest().lat() - 0.05, rutaBounds.getSouthWest().lng() - 0.05),
      new g.LatLng(rutaBounds.getNorthEast().lat() + 0.05, rutaBounds.getNorthEast().lng() + 0.05)
    );

    if (!toleranciaBounds.contains(posActual)) {
      this.alertaDesvio = "⚠️ ALERTA: Unidad fuera del cuadrante de la ruta asignada.";
    } else {
      this.alertaDesvio = null; 
    }
  }

  resaltarCamionSeleccionado(codigoSeleccionado: string) {
    const g = (window as any).google.maps;
    for (const codigo in this.marcadoresCamiones) {
      const marcador = this.marcadoresCamiones[codigo];
      const icon = marcador.getIcon();
      
      if (codigo === codigoSeleccionado) {
        icon.fillColor = '#ef4444'; 
        icon.scale = 9; 
        marcador.setZIndex(1000);
      } else {
        icon.fillColor = '#94a3b8'; 
        icon.scale = 6;
        marcador.setZIndex(999);
      }
      marcador.setIcon(icon);
    }
  }

  // ==========================================
  // 🎮 EL SIMULADOR DE VIAJES (MODO TESTING)
  // ==========================================
  
  toggleSimulador() {
    if (this.simulacionActiva) {
      this.detenerSimulacion();
    } else {
      this.iniciarSimulacion();
    }
  }

  iniciarSimulacion() {
    if (!this.viajeSeleccionado || !this.rutaPath.length) {
      alert("Traza la ruta primero seleccionando el camión.");
      return;
    }

    this.simulacionActiva = true;
    this.pasoSimulacion = 0; // Empezamos desde el inicio de la ruta
    
    // Calcula la dirección matemática (Rumbo) para que la flecha gire
    const g = (window as any).google.maps;

    // Disparamos coordenadas cada 2 segundos
    this.simulacionInterval = setInterval(() => {
      if (this.pasoSimulacion >= this.rutaPath.length) {
        this.detenerSimulacion();
        alert("🏁 Simulación finalizada. El camión llegó a su destino.");
        return;
      }

      const puntoActual = this.rutaPath[this.pasoSimulacion];
      
      // Calcular rumbo (hacia dónde apunta el camión)
      let heading = 0;
      if (this.pasoSimulacion < this.rutaPath.length - 1) {
        const puntoSiguiente = this.rutaPath[this.pasoSimulacion + 1];
        heading = g.geometry.spherical.computeHeading(puntoActual, puntoSiguiente);
      }

      const payload = {
        latitud_actual: puntoActual.lat().toFixed(7),
        longitud_actual: puntoActual.lng().toFixed(7),
        rumbo_actual: heading.toFixed(2),
        ultima_actualizacion_gps: new Date().toISOString()
      };

      // Mandamos la coordenada fantasma a Django
      this.viajeService.actualizarEstadoViaje(this.viajeSeleccionado.codigo_viaje, payload).subscribe({
        next: () => {
          // El propio setInterval de la línea 46 refrescará el mapa y moverá el camión
          console.log("🎮 Simulador avanzó al paso", this.pasoSimulacion);
        }
      });

      this.pasoSimulacion += 3; // Saltamos 3 puntos a la vez para que el camión no vaya a 5km/h
    }, 2000);
  }

  detenerSimulacion() {
    this.simulacionActiva = false;
    if (this.simulacionInterval) {
      clearInterval(this.simulacionInterval);
      this.simulacionInterval = null;
    }
  }
}