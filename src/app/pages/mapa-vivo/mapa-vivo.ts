import { Component, AfterViewInit, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

// Definimos una interfaz para los camiones
interface Truck {
  id: string;
  start: [number, number]; // Punto de inicio
  end: [number, number];   // Punto actual
  route: [number, number][]; // Lista de puntos del recorrido
}

@Component({
  selector: 'app-mapa-vivo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-vivo.html',
  styleUrls: ['./mapa-vivo.css']
})
export class MapaVivo implements AfterViewInit, OnDestroy {
  private map: any;
  private L: any;
  private baseLayer: any;

  // Flota de Transkelion en La Paz (coordenadas reales)
  private flota: Truck[] = [
    { id: 'T-01', start: [-16.490, -68.140], end: [-16.501, -68.132], route: [[-16.490, -68.140], [-16.495, -68.136], [-16.501, -68.132]] }, // Desde El Alto a El Prado
    { id: 'T-02', start: [-16.515, -68.115], end: [-16.505, -68.110], route: [[-16.515, -68.115], [-16.510, -68.112], [-16.505, -68.110]] }, // Cerca de Miraflores
    { id: 'T-03', start: [-16.540, -68.085], end: [-16.528, -68.092], route: [[-16.540, -68.085], [-16.535, -68.088], [-16.528, -68.092]] }  // Zona Sur / Calacoto
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.L = await import('leaflet');
      setTimeout(() => {
        this.initMap();
        this.dibujarRecorridos();
        this.obtenerMiUbicacion();
      }, 200); // Pequeño retraso para que cargue el HTML
    }
  }

  private initMap(): void {
    if (this.map) return;

    this.map = this.L.map('map-container', {
      center: [-16.500, -68.120], // Centro de La Paz
      zoom: 14,
      zoomControl: false
    });

    this.baseLayer = this.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(this.map);
    this.L.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  private dibujarRecorridos() {
    // 1. Icono de Camión Real (URL de un camión profesional)
    const truckIcon = this.L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048314.png', // Icono de Camión de Carga
      iconSize: [35, 35],
      iconAnchor: [17, 35], // El ancla es la base del camión
      popupAnchor: [0, -30]
    });

    this.flota.forEach(camion => {
      // 2. Dibujar el Recorrido (Línea azul punteada)
      this.L.polyline(camion.route, {
        color: '#007bff', // Azul de acento de Transkelion
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10' // Punteado
      }).addTo(this.map);

      // 3. Dibujar el Camión en el punto final
      this.L.marker(camion.end, { icon: truckIcon })
        .addTo(this.map)
        .bindPopup(`<b>Unidad: ${camion.id}</b><br>Estado: En ruta`);

      // 4. (Opcional) Dibujar un punto de inicio
      this.L.circleMarker(camion.start, { radius: 5, color: '#28a745', fillOpacity: 1 }).addTo(this.map);
    });
  }

  private obtenerMiUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        const miIcono = this.L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/7114/7114844.png',
          iconSize: [40, 40]
        });
        this.L.marker(coords, { icon: miIcono }).addTo(this.map).bindPopup('Tu Ubicación').openPopup();
      });
    }
  }

  cambiarMapaBase(tipo: string) {
    if (this.baseLayer) this.map.removeLayer(this.baseLayer);
    const url = tipo === 'satelital' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    this.baseLayer = this.L.tileLayer(url).addTo(this.map);
  }

  ngOnDestroy() { if (this.map) this.map.remove(); }
}