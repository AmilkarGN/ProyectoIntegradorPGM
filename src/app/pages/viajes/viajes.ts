import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViajeService } from '../../services/viaje'; 

@Component({
  selector: 'app-viajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viajes.html',
  styleUrls: ['./viajes.css']
})
export class ViajesComponent implements OnInit {
  viajes: any[] = [];
  estados: any[] = [];
  asignacionesActivas: any[] = [];
  rutas: any[] = [];
  reservasPendientes: any[] = [];

  mostrarModalViaje = false;
  mostrarModalViaticos = false;
  mostrarModalDetalles = false;
  viajeSeleccionado: any = null;

  nuevoViaje: any = { 
    codigo_viaje: '', 
    ruta: '', 
    asignacion: '', 
    estado_viaje: '', 
    fecha_salida: '', 
    fecha_llegada_estimada: '',
    reservas_seleccionadas: [] 
  };
  nuevoViatico: any = { descripcion: '', monto_total: null };

  // Variables de control de carga
  pesoTotalCalculado = 0;
  capacidadCamion = 0;
  rutaNombreSeleccionada = ''; // Para mostrar el nombre de la ruta

  mensajeToast = '';
  tipoToast: 'success' | 'error' = 'success';
  mostrarToast = false;

  constructor(private viajeService: ViajeService) {}

  ngOnInit(): void {
    this.cargarDatosMaestros();
    this.cargarViajes();
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    this.mostrarToast = true;
    setTimeout(() => this.mostrarToast = false, 3500);
  }

  cargarDatosMaestros() {
    this.viajeService.obtenerAsignacionesActivas().subscribe(res => this.asignacionesActivas = res);
    this.viajeService.obtenerEstadosViaje().subscribe(res => this.estados = res);
    this.viajeService.obtenerRutas().subscribe(res => this.rutas = res);
    this.viajeService.obtenerReservasPendientes().subscribe(res => this.reservasPendientes = res);
  }

  cargarViajes() {
    this.viajeService.obtenerViajes().subscribe(res => this.viajes = res);
  }

  // --- INTELIGENCIA DE NEGOCIO ---

  alSeleccionarVehiculo() {
    const asig = this.asignacionesActivas.find(a => a.id == this.nuevoViaje.asignacion);
    if (asig) {
      // Ajustamos al nombre que Django suele mandar si serializas el vehículo
      this.capacidadCamion = asig.vehiculo_capacidad_carga || asig.capacidad || 0; 
      if (this.capacidadCamion === 0) console.warn("La capacidad del camión llegó en 0 desde el servidor.");
    }
  }

  toggleReserva(reserva: any, event: any) {
    const peso = parseFloat(reserva.peso_estimado_kg || 0);
    const codigo = reserva.codigo_reserva;

    if (event.target.checked) {
      this.nuevoViaje.reservas_seleccionadas.push(codigo);
      this.pesoTotalCalculado += peso;

      // Si es la primera reserva, heredamos TODO de ella
      if (this.nuevoViaje.reservas_seleccionadas.length === 1) {
        this.nuevoViaje.ruta = reserva.ruta_macro;
        this.actualizarNombreRuta(reserva.ruta_macro);
        
        // Sincronizar fechas automáticas
        if (reserva.fecha_tentativa_viaje) {
          // Convertimos la fecha de la reserva a formato datetime-local para el input
          this.nuevoViaje.fecha_salida = reserva.fecha_tentativa_viaje + "T08:00"; 
          this.calcularLlegadaAutomatica(reserva.tiempo_estimado_horas);
        }
      }
    } else {
      this.nuevoViaje.reservas_seleccionadas = this.nuevoViaje.reservas_seleccionadas.filter((c:any) => c !== codigo);
      this.pesoTotalCalculado -= peso;
      if (this.nuevoViaje.reservas_seleccionadas.length === 0) {
        this.nuevoViaje.ruta = '';
        this.rutaNombreSeleccionada = '';
      }
    }
  }

  actualizarNombreRuta(idRuta: any) {
    const rutaObj = this.rutas.find(r => r.id == idRuta);
    if (rutaObj) {
      this.rutaNombreSeleccionada = `${rutaObj.origen} ➡️ ${rutaObj.destino}`;
    }
  }

  calcularLlegadaAutomatica(horasViaje: any) {
    if (!this.nuevoViaje.fecha_salida || !horasViaje) return;

    const fechaSalida = new Date(this.nuevoViaje.fecha_salida);
    // Sumamos las horas (en milisegundos)
    const fechaLlegada = new Date(fechaSalida.getTime() + (parseFloat(horasViaje) * 60 * 60 * 1000));
    
    // Formatear para el input datetime-local (YYYY-MM-DDTHH:mm)
    this.nuevoViaje.fecha_llegada_estimada = fechaLlegada.toISOString().slice(0, 16);
  }

  // --- CRUD ---

  abrirModalViaje() {
    this.nuevoViaje = { codigo_viaje: `VIA-${Math.floor(Math.random() * 10000)}`, ruta: '', asignacion: '', estado_viaje: '', fecha_salida: '', fecha_llegada_estimada: '', reservas_seleccionadas: [] };
    this.pesoTotalCalculado = 0;
    this.rutaNombreSeleccionada = '';
    this.mostrarModalViaje = true;
  }

  guardarViaje() {
    this.viajeService.crearViaje(this.nuevoViaje).subscribe({
      next: () => {
        this.mostrarMensaje('Viaje despachado.', 'success');
        this.mostrarModalViaje = false;
        this.cargarViajes();
        this.cargarDatosMaestros();
      },
      error: () => this.mostrarMensaje('Error al crear el viaje.', 'error')
    });
  }

  // ... (cambiarEstadoViaje, abrirDetalles, viáticos se mantienen)
  abrirDetalles(v:any) { this.viajeSeleccionado = v; this.mostrarModalDetalles = true; }
  cambiarEstadoViaje(v:any, e:any) { this.viajeService.actualizarEstadoViaje(v.codigo_viaje, {estado_viaje: e}).subscribe(); }
  abrirViaticos(v:any) { this.viajeSeleccionado = v; this.nuevoViatico = {viaje: v.codigo_viaje, estado: 'Pendiente'}; this.mostrarModalViaticos = true; }
}