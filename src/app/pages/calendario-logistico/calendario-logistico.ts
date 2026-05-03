import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID, OnInit, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { registerLocaleData } from '@angular/common';
import * as localeEs from '@angular/common/locales/es';

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
  
  // 👇 AQUÍ GUARDAMOS LO QUE VIENE DE DJANGO
  todosLosEventos: any[] = [];
  
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
    events: [], // Esto se llenará dinámicamente
    dateClick: (arg: any) => this.abrirOpcionesNuevoEvento(arg.dateStr),
    eventClick: (arg: any) => this.abrirDetallesEvento(arg)
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarEventosDesdeBD();
    }
  }

  // --- 🌟 EL ÚNICO LLAMADO QUE TU INGE VERÁ EN NETWORK ---
  cargarEventosDesdeBD(): void {
    this.http.get<any[]>('http://localhost:8000/api/calendario-eventos/').subscribe({
      next: (eventos) => {
        this.todosLosEventos = eventos;
        this.aplicarFiltrosCalendario(); 
      },
      error: (err) => console.error("Error cargando eventos del calendario", err)
    });
  }

  // --- LÓGICA DE CAPAS (FILTROS) SÚPER RÁPIDA ---
  toggleFiltro(tipo: 'operaciones' | 'conductores' | 'vehiculos') {
    this.filtros[tipo] = !this.filtros[tipo];
    this.aplicarFiltrosCalendario();
  }

  aplicarFiltrosCalendario(): void {
    // Ya no hacemos cálculos matemáticos, solo decidimos qué capas dibujar
    const eventosFiltrados = this.todosLosEventos.filter(evento => {
      const categoria = evento.extendedProps.categoria;
      if (categoria === 'operaciones') return this.filtros.operaciones;
      if (categoria === 'conductores') return this.filtros.conductores;
      if (categoria === 'vehiculos') return this.filtros.vehiculos;
      return false;
    });

    this.calendarOptions = { ...this.calendarOptions, events: eventosFiltrados };
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

  // --- DETALLES DE EVENTOS ---
  abrirDetallesEvento(arg: any): void {
    arg.jsEvent.preventDefault();
    const props = arg.event.extendedProps;
    
    this.ngZone.run(() => {
      this.tipoEventoSeleccionado = props.tipo;
      
      // La data ya viene lista desde nuestro backend
      if (props.tipo === 'reserva') this.reservaSeleccionada = props.data;
      if (props.tipo === 'viaje') this.viajeSeleccionado = props.data;
      if (props.tipo.startsWith('legal')) this.datosLegalesSeleccionados = { ...props.data, tramite: props.sub };
      
      this.mostrarModalDetalles = true;
    });
  }
}