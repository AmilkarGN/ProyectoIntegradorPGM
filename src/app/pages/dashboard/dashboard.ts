import { Component, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';


interface Vehiculo {
  id: string;
  coord: [number, number];
  estado: string;
  ruta: [number, number][]; // Esto le dice a TS que es una lista de coordenadas
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements AfterViewInit {
  private map: any;
  private currentPolyline: any;
  private L: any;

  // RUTAS DE LA FLOTA (Ejemplo profesional)
  
  private flotaCoords: Vehiculo[] = [
    { 
      id: 'T-01', 
      coord: [-16.5085, -68.1264], 
      estado: 'En Ruta', 
      ruta: [[-16.5085, -68.1264], [-16.5075, -68.1270], [-16.5045, -68.1298]] 
    },
    { 
      id: 'T-02', 
      coord: [-16.4950, -68.1320], 
      estado: 'Carga', 
      ruta: [[-16.4950, -68.1320], [-16.4970, -68.1340], [-16.5000, -68.1360]] 
    },
    { 
      id: 'T-03', 
      coord: [-16.5150, -68.1200], 
      estado: 'Mantenimiento', 
      ruta: [[-16.5150, -68.1200], [-16.5170, -68.1220], [-16.5200, -68.1240]] 
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.L = await import('leaflet');
      this.initMap();
    }
  }

  private initMap(): void {
    // Inicializar mapa (Look Claro 'Voyager')
    this.map = this.L.map('map', { center: [-16.5050, -68.1280], zoom: 14, zoomControl: false });
    this.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '© CARTO' }).addTo(this.map);

    // Añadir controles de zoom en posición UX correcta
    this.L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // DIBUJAR FLOTA COMPLETA
    this.flotaCoords.forEach(vehiculo => {
      const truckIcon = this.L.divIcon({
        html: `<div style="font-size: 2.2rem; transform: rotate(90deg); filter: drop-shadow(0 0 5px rgba(0,0,0,0.3));">🚛</div>`,
        className: 'truck-marker', iconSize: [40, 40], iconAnchor: [20, 20]
      });

      const marker = this.L.marker(vehiculo.coord, { icon: truckIcon }).addTo(this.map);
      
      // AL CLICAR, DIBUJAR RUTA
      marker.on('click', () => {
        this.dibujarRuta(vehiculo.ruta, vehiculo.id);
      });

      marker.bindPopup(`<b>Unidad:</b> ${vehiculo.id}<br><b>Estado:</b> ${vehiculo.estado}`);
    });
  }

  dibujarRuta(coordenadas: [number, number][], id: string) {
    if (this.currentPolyline) this.map.removeLayer(this.currentPolyline); // Limpiar ruta anterior
    
    this.currentPolyline = this.L.polyline(coordenadas, {
      color: '#007bff', // Azul Eléctrico (Nuevo Color de Acento)
      weight: 5, opacity: 0.8, dashArray: '10, 10'
    }).addTo(this.map);
    
    this.map.fitBounds(this.currentPolyline.getBounds()); // Centrar en la ruta
    console.log(`Visualizando ruta de la unidad: ${id}`);
  }

  cambiarMapaBase(tipo: string) {
    // Eliminar capas anteriores
    this.map.eachLayer((layer: any) => {
      if (layer instanceof this.L.TileLayer) this.map.removeLayer(layer);
    });

    const url = tipo === 'satelital' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
    this.L.tileLayer(url).addTo(this.map);
  }
}