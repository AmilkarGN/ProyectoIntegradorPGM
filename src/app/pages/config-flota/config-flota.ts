import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculoService, ModeloVehiculo, TipoVehiculo, EstadoVehiculo } from '../../services/vehiculo';
import { ConductorService, CategoriaLicencia } from '../../services/conductor';

@Component({
  selector: 'app-config-flota',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-flota.html',
  styleUrls: ['./config-flota.css'] 
})
export class ConfigFlotaComponent implements OnInit {
  // Datos
  modelos: ModeloVehiculo[] = [];
  tipos: TipoVehiculo[] = [];
  estados: EstadoVehiculo[] = [];
  categorias: CategoriaLicencia[] = [];

  // UI
  tabActiva: 'modelos' | 'tipos' | 'estados' = 'modelos';
  mostrarModal = false;
  objetoActual: any = {};

  constructor(
    private vehiculoService: VehiculoService,
    private conductorService: ConductorService
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.vehiculoService.obtenerModelos().subscribe(m => this.modelos = m);
    this.vehiculoService.obtenerTipos().subscribe(t => this.tipos = t);
    this.vehiculoService.obtenerEstados().subscribe(e => this.estados = e);
    this.conductorService.obtenerCategorias().subscribe(c => this.categorias = c);
  }

  abrirModal(item?: any): void {
    if (item) {
      this.objetoActual = { ...item };
    } else {
      this.objetoActual = {}; // Limpio para crear
    }
    this.mostrarModal = true;
  }

  guardar(): void {
    if (this.tabActiva === 'modelos') {
      const op = this.objetoActual.id ? 
        this.vehiculoService.actualizarModelo(this.objetoActual.id, this.objetoActual) : 
        this.vehiculoService.crearModelo(this.objetoActual);
      op.subscribe(() => { this.cargarTodo(); this.mostrarModal = false; });
    } 
    else if (this.tabActiva === 'tipos') {
      const op = this.objetoActual.id ? 
        this.vehiculoService.actualizarTipo(this.objetoActual.id, this.objetoActual) : 
        this.vehiculoService.crearTipo(this.objetoActual);
      op.subscribe(() => { this.cargarTodo(); this.mostrarModal = false; });
    }
    else {
      const op = this.objetoActual.id ? 
        this.vehiculoService.actualizarEstado(this.objetoActual.id, this.objetoActual) : 
        this.vehiculoService.crearEstado(this.objetoActual);
      op.subscribe(() => { this.cargarTodo(); this.mostrarModal = false; });
    }
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    
    let serv;
    if (this.tabActiva === 'modelos') serv = this.vehiculoService.eliminarModelo(id);
    else if (this.tabActiva === 'tipos') serv = this.vehiculoService.eliminarTipo(id);
    else serv = this.vehiculoService.eliminarEstado(id);

    serv.subscribe({
      next: () => this.cargarTodo(),
      error: () => alert('No se puede eliminar: el registro está siendo usado por un vehículo.')
    });
  }
}