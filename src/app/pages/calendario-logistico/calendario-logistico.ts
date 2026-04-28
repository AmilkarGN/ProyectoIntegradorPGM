import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID, OnInit, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // 👈 Importante para traer conductores y vehículos

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { registerLocaleData } from '@angular/common';
import * as localeEs from '@angular/common/locales/es';
import { ReservaService } from '../../services/reserva';
import { ViajeService } from '../../services/viaje';

// Registramos el idioma español
registerLocaleData(localeEs.default || localeEs, 'es');

@Component({
  selector: 'app-calendario-logistico',
  standalone: true,
  imports: [CommonModule, FullCalendarModule], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './calendario-logistico.html',
  styleUrls: ['./calendario-logistico.css']
})
export class CalendarioLogistico implements OnInit {
  isBrowser: boolean = false;
  
  // Control de Modales
  mostrarModalDetalles: boolean = false;
  mostrarModalOpciones: boolean = false;
  
  // Listas de datos maestros
  todasLasReservas: any[] = [];
  todosLosViajes: any[] = [];
  todosLosConductores: any[] = [];
  todosLosVehiculos: any[] = [];
  
  // Control de Filtros
  filtros = { operaciones: true, conductores: false, vehiculos: false };

  // Variables de selección
  tipoEventoSeleccionado: string = '';
  reservaSeleccionada: any = {};
  viajeSeleccionado: any = {};
  datosLegalesSeleccionados: any = {};
  fechaSeleccionadaParaNuevo: string = '';
  
  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    dateClick: (arg: any) => this.abrirOpcionesNuevoEvento(arg.dateStr),
    eventClick: (arg: any) => this.abrirDetallesEvento(arg)
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private reservaService: ReservaService,
    private viajeService: ViajeService,
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarTodoDesdeBD();
    }
  }

  // --- CARGA DE DATOS ---
  cargarTodoDesdeBD(): void {
    this.reservaService.obtenerReservas().subscribe(res => {
      this.todasLasReservas = res;
      this.viajeService.obtenerViajes().subscribe(viajes => {
        this.todosLosViajes = viajes;
        this.construirCalendario(); 
      });
    });

    // Traemos Conductores y Vehículos (Ajusta la URL a tus endpoints reales si son distintos)
    this.http.get<any[]>('http://localhost:8000/api/conductores/').subscribe(res => this.todosLosConductores = res);
    this.http.get<any[]>('http://localhost:8000/api/vehiculos/').subscribe(res => this.todosLosVehiculos = res);
  }

  // --- LÓGICA DE PANEL SELECTOR ---
  abrirOpcionesNuevoEvento(fecha: string) {
    this.ngZone.run(() => {
      this.fechaSeleccionadaParaNuevo = fecha;
      this.mostrarModalOpciones = true;
    });
  }

  abrirOpcionesSinFecha() {
    this.abrirOpcionesNuevoEvento(''); 
  }

  irAFormulario(tipo: 'reserva' | 'viaje') {
    this.mostrarModalOpciones = false;
    
    // 👇 EL TRUCO DE LA REDIRECCIÓN CON AUTO-APERTURA DE MODAL
    const navigationExtras = {
      queryParams: { 
        fecha_nueva: this.fechaSeleccionadaParaNuevo,
        abrir_modal: 'true'
      }
    };
    
    if (tipo === 'reserva') {
      this.router.navigate(['/dashboard/reservas'], navigationExtras);
    } else {
      this.router.navigate(['/dashboard/viajes'], navigationExtras);
    }
  }

  // --- LÓGICA DE CAPAS (FILTROS) ---
  toggleFiltro(tipo: 'operaciones' | 'conductores' | 'vehiculos') {
    this.filtros[tipo] = !this.filtros[tipo];
    this.construirCalendario();
  }

  construirCalendario(): void {
    const eventos: any[] = [];

    // 1. CAPA DE OPERACIONES
    if (this.filtros.operaciones) {
      this.todasLasReservas.forEach(r => {
        if (r.fecha_tentativa_viaje) {
          eventos.push({
            title: `📦 RES: ${r.codigo_reserva}`,
            date: r.fecha_tentativa_viaje.split('T')[0],
            backgroundColor: r.es_fragil ? '#ef4444' : '#475569',
            borderColor: r.es_fragil ? '#ef4444' : '#475569',
            extendedProps: { tipo: 'reserva', data: r }
          });
        }
      });

      this.todosLosViajes.forEach(v => {
        if (v.fecha_salida) {
          eventos.push({
            title: `🚛 SALIDA: ${v.codigo_viaje}`,
            date: v.fecha_salida.split('T')[0],
            backgroundColor: '#3b82f6', borderColor: '#3b82f6',
            extendedProps: { tipo: 'viaje', data: v }
          });
        }
        if (v.fecha_llegada_estimada) {
          eventos.push({
            title: `🏁 LLEGADA: ${v.codigo_viaje}`,
            date: v.fecha_llegada_estimada.split('T')[0],
            backgroundColor: '#10b981', borderColor: '#10b981',
            extendedProps: { tipo: 'viaje', data: v }
          });
        }
      });
    }

    // 2. CAPA DE CONDUCTORES
    if (this.filtros.conductores) {
      this.todosLosConductores.forEach(c => {
        if (c.vencimiento_licencia) {
          eventos.push({
            title: `🪪 LICENCIA: ${c.usuario?.nombre || 'Conductor'}`,
            date: c.vencimiento_licencia,
            backgroundColor: '#f59e0b', borderColor: '#f59e0b',
            extendedProps: { tipo: 'legal_conductor', data: c, sub: 'Licencia' }
          });
        }
        if (c.fecha_nacimiento) {
          // Ajustar el cumpleaños al año actual para que se vea
          const hoy = new Date();
          const cumple = new Date(c.fecha_nacimiento);
          const fechaCumple = `${hoy.getFullYear()}-${(cumple.getMonth()+1).toString().padStart(2,'0')}-${cumple.getDate().toString().padStart(2,'0')}`;
          
          eventos.push({
            title: `🎂 CUMPLE: ${c.usuario?.nombre || 'Conductor'}`,
            date: fechaCumple,
            backgroundColor: '#ec4899', borderColor: '#ec4899',
            extendedProps: { tipo: 'legal_conductor', data: c, sub: 'Cumpleaños' }
          });
        }
      });
    }

    // 3. CAPA DE VEHÍCULOS
    if (this.filtros.vehiculos) {
      this.todosLosVehiculos.forEach(veh => {
        if (veh.vencimiento_soat) {
          eventos.push({
            title: `🛡️ SOAT: ${veh.placa}`,
            date: veh.vencimiento_soat,
            backgroundColor: '#8b5cf6', borderColor: '#8b5cf6',
            extendedProps: { tipo: 'legal_vehiculo', data: veh, sub: 'SOAT' }
          });
        }
        if (veh.vencimiento_inspeccion_tecnica) {
          eventos.push({
            title: `🔧 INSPECCIÓN: ${veh.placa}`,
            date: veh.vencimiento_inspeccion_tecnica,
            backgroundColor: '#06b6d4', borderColor: '#06b6d4',
            extendedProps: { tipo: 'legal_vehiculo', data: veh, sub: 'Inspección Técnica' }
          });
        }
      });
    }

    this.calendarOptions = { ...this.calendarOptions, events: eventos };
  }

  // --- DETALLES DE EVENTOS ---
  abrirDetallesEvento(arg: any): void {
    arg.jsEvent.preventDefault();
    const props = arg.event.extendedProps;
    
    this.ngZone.run(() => {
      this.tipoEventoSeleccionado = props.tipo;
      if (props.tipo === 'reserva') this.reservaSeleccionada = props.data;
      if (props.tipo === 'viaje') this.viajeSeleccionado = props.data;
      if (props.tipo.startsWith('legal')) this.datosLegalesSeleccionados = { ...props.data, tramite: props.sub };
      
      this.mostrarModalDetalles = true;
    });
  }
}