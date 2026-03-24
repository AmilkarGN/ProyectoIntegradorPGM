import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core'; 
import { isPlatformBrowser, CommonModule } from '@angular/common';

// Asegúrate de que estas librerías estén instaladas
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendario-logistico',
  standalone: true,
  imports: [CommonModule, FullCalendarModule], // <--- Si esto falla, revisa el paso 3 abajo
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './calendario-logistico.html',
  styleUrls: ['./calendario-logistico.css']
})
export class CalendarioLogistico implements AfterViewInit {
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {}

  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [
      { title: '🚛 Despacho T-01: El Alto', date: '2026-03-25', backgroundColor: '#007bff' },
      { title: '📦 Entrega T-02: Zona Sur', date: '2026-03-26', backgroundColor: '#10b981' },
      { title: '🔧 Mantenimiento T-03', date: '2026-03-24', backgroundColor: '#ef4444' },
      { title: '🚚 Carga Masiva: Aduana', start: '2026-03-28', end: '2026-03-30', backgroundColor: '#6366f1' }
    ],
    dateClick: (arg: any) => alert('Nueva reserva para: ' + arg.dateStr),
    eventClick: (arg: any) => alert('Evento: ' + arg.event.title)
  };
}