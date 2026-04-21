import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  VehiculoService, Vehiculo, ModeloVehiculo, 
  TipoVehiculo, EstadoVehiculo 
} from '../../services/vehiculo';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.html',
  styleUrls: ['./vehiculos.css'] // Reutilizamos tu excelente diseño de tablas
})
export class VehiculosComponent implements OnInit {
  vehiculos: Vehiculo[] = [];
  modelos: ModeloVehiculo[] = [];
  tipos: TipoVehiculo[] = [];
  estados: EstadoVehiculo[] = [];

  cargando = true;
  mostrarModal = false;
  modoModal: 'crear' | 'editar' | 'ver' = 'crear';
  
  vehiculoActual: Vehiculo | any = {};
  archivoFoto: File | null = null;
  baseMediaUrl = 'http://localhost:8000';
  fechaHoy: string = new Date().toISOString().split('T')[0];

  // Guardamos la placa original al editar por si el usuario la intenta cambiar
  placaOriginalEdicion: string = '';

  constructor(private vehiculoService: VehiculoService) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.cargando = true;
    this.vehiculoService.obtenerModelos().subscribe(m => this.modelos = m);
    this.vehiculoService.obtenerTipos().subscribe(t => this.tipos = t);
    this.vehiculoService.obtenerEstados().subscribe(e => this.estados = e);
    this.cargarVehiculos();
  }

  cargarVehiculos(): void {
    this.vehiculoService.obtenerVehiculos().subscribe({
      next: (data) => { this.vehiculos = data; this.cargando = false; },
      error: (err) => { console.error('Error:', err); this.cargando = false; }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) this.archivoFoto = file;
  }

  abrirModalCrear(): void {
    this.modoModal = 'crear';
    this.vehiculoActual = { placa: '', modelo: null, tipo: null, estado: null };
    this.archivoFoto = null;
    this.mostrarModal = true;
  }

  editarVehiculo(vehiculo: Vehiculo): void {
    this.modoModal = 'editar';
    this.vehiculoActual = { ...vehiculo };
    this.placaOriginalEdicion = vehiculo.placa; // Protegemos la llave primaria
    this.archivoFoto = null;
    this.mostrarModal = true;
  }

  verVehiculo(vehiculo: Vehiculo): void {
    this.modoModal = 'ver';
    this.vehiculoActual = { ...vehiculo };
    this.mostrarModal = true;
  }

  cerrarModal(): void { this.mostrarModal = false; }

  guardarVehiculo(): void {
    const formData = new FormData();
    formData.append('placa', this.vehiculoActual.placa);
    formData.append('modelo', this.vehiculoActual.modelo);
    formData.append('tipo', this.vehiculoActual.tipo);
    formData.append('estado', this.vehiculoActual.estado);
    
    if (this.vehiculoActual.chasis) formData.append('chasis', this.vehiculoActual.chasis);
    if (this.vehiculoActual.color) formData.append('color', this.vehiculoActual.color);
    if (this.vehiculoActual.vencimiento_soat) formData.append('vencimiento_soat', this.vehiculoActual.vencimiento_soat);
    if (this.vehiculoActual.vencimiento_inspeccion_tecnica) formData.append('vencimiento_inspeccion_tecnica', this.vehiculoActual.vencimiento_inspeccion_tecnica);
    
    if (this.archivoFoto) {
      formData.append('foto', this.archivoFoto, this.archivoFoto.name);
    }

    if (this.modoModal === 'editar') {
      this.vehiculoService.actualizarVehiculo(this.placaOriginalEdicion, formData).subscribe({
        next: () => { this.cargarVehiculos(); this.cerrarModal(); },
        error: () => alert('Error al actualizar. Revisa la consola.')
      });
    } else {
      this.vehiculoService.crearVehiculo(formData).subscribe({
        next: () => { this.cargarVehiculos(); this.cerrarModal(); },
        error: () => alert('Error al crear. Asegúrate de que la placa no exista ya.')
      });
    }
  }

  eliminarVehiculo(placa: string): void {
    if (confirm(`¿Estás seguro de eliminar el vehículo con placa ${placa}?`)) {
      this.vehiculoService.eliminarVehiculo(placa).subscribe({
        next: () => this.vehiculos = this.vehiculos.filter(v => v.placa !== placa),
        error: () => alert('No se puede eliminar. Probablemente tiene asignaciones activas.')
      });
    }
  }

  obtenerImagenUrl(url: string | undefined): string {
    if (!url) return 'assets/images/icono.png'; // Tu logo de camión por defecto
    return url.startsWith('http') ? url : `${this.baseMediaUrl}${url}`;
  }
}