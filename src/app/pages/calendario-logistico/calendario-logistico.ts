import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID, AfterViewInit, OnInit, ChangeDetectorRef, NgZone} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// Importamos el servicio de Reservas
import { ReservaService, Reserva } from '../../services/reserva';
import { Router } from '@angular/router'; // 👈 Importar esto

@Component({
  
  selector: 'app-calendario-logistico',
  standalone: true,
  imports: [CommonModule, FullCalendarModule], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './calendario-logistico.html',
  styleUrls: ['./calendario-logistico.css']
})
export class CalendarioLogistico implements OnInit, AfterViewInit {
  isBrowser: boolean = false;
  mostrarModalReserva: boolean = false;
  reservaSeleccionada: any = {};
  todasLasReservas: any[] = [];
  
  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: 'es',
    headerToolbar: {
      
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [], // Empezamos vacío
    dateClick: (arg: any) => this.irACrearReserva(arg.dateStr),
    eventClick: (arg: any) => {
      // Evita que el navegador intente hacer otras cosas con el clic
      arg.jsEvent.preventDefault();
      
      const codigoBuscado = arg.event.extendedProps.codigo;
      
      console.log('Buscando reserva con código:', codigoBuscado);
      
      // Buscamos en la lista que guardamos arriba
      const reserva = this.todasLasReservas.find(r => r.codigo_reserva === codigoBuscado);
      
      if (reserva) {
        console.log('Reserva encontrada:', reserva);
        this.reservaSeleccionada = reserva;
        this.mostrarModalReserva = true;
        this.cdr.detectChanges();
        this.ngZone.run(() => {
          this.reservaSeleccionada = reserva;
          this.mostrarModalReserva = true;
        });
      } else {
        console.error('No se encontró la reserva en la lista local. Lista actual:', this.todasLasReservas);
      }
    }
  };
  irACrearReserva(fecha: string): void {
    // ¡AQUÍ ESTÁ LA MAGIA! Agregamos /dashboard/ antes de reservas
    this.router.navigate(['/dashboard/reservas'], { queryParams: { fecha: fecha } });
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private reservaService: ReservaService, // Inyectamos el servicio
    private router: Router, // <--- Esta palabra "private" es la que hace la magia
    private cdr: ChangeDetectorRef, // <--- INYECTAMOS EL DETECTOR DE CAMBIOS
    private ngZone: NgZone // <--- INYECTAMOS NGZONE
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarEventosDesdeBD();
    }
  }

  ngAfterViewInit() {}

  cargarEventosDesdeBD(): void {
    this.reservaService.obtenerReservas().subscribe(reservas => {
      // 1. IMPORTANTE: Guardamos la lista completa primero
      this.todasLasReservas = reservas; 

      const eventos = reservas.map(r => {
        // 2. CAMBIO DE COLOR: 
        // Si la leyenda dice: Azul (Despacho), Verde (Entrega), Rojo (Taller)
        // Pongamos las reservas en Azul, y si es frágil, un Azul más fuerte o un Dorado.
        let colorFondo = '#007bff'; // Azul estándar (Despacho)
        
        if (r.es_fragil) {
          colorFondo = '#f59e0b'; // Dorado/Naranja para advertir fragilidad sin ser "Taller"
        }
        
        return {
          title: `🚛 ${r.codigo_reserva}`,
          date: r.fecha_tentativa_viaje,
          backgroundColor: colorFondo,
          borderColor: colorFondo,
          extendedProps: {
            codigo: r.codigo_reserva // Este es el ID para buscarlo luego
          }
        };
      });

      // 3. Actualizamos las opciones del calendario con los nuevos eventos
      this.calendarOptions = {
        ...this.calendarOptions,
        events: eventos
      };
    });
  }

  alHacerClicEnFecha(fecha: string): void {
    // Si tuvieras un servicio de ruteo en Angular, aquí podrías redirigir:
    // this.router.navigate(['/reservas'], { queryParams: { fecha: fecha } });
    alert('Puedes ir al panel de Reservas para programar un viaje el: ' + fecha);
  }
}