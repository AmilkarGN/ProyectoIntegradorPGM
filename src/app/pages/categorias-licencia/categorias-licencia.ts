import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConductorService, CategoriaLicencia } from '../../services/conductor';

@Component({
  selector: 'app-categorias-licencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias-licencia.html',
  styleUrls: ['./categorias-licencia.css'] // Reutilizamos los estilos
})
export class CategoriasLicenciaComponent implements OnInit {
  categorias: CategoriaLicencia[] = [];
  cargando = true;
  mostrarModal = false;
  
  categoriaActual: CategoriaLicencia = { id: 0, nombre: '', permite_maquinaria_pesada: false };

  constructor(private conductorService: ConductorService) {}

  ngOnInit(): void { this.cargarCategorias(); }

  cargarCategorias(): void {
    this.cargando = true;
    this.conductorService.obtenerCategorias().subscribe({
      next: (data) => { this.categorias = data; this.cargando = false; },
      error: (err) => { console.error('Error:', err); this.cargando = false; }
    });
  }

  abrirModal(categoria?: CategoriaLicencia): void {
    if (categoria) {
      this.categoriaActual = { ...categoria };
    } else {
      this.categoriaActual = { id: 0, nombre: '', permite_maquinaria_pesada: false };
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void { this.mostrarModal = false; }

  guardarCategoria(): void {
    if (this.categoriaActual.id && this.categoriaActual.id > 0) {
      this.conductorService.actualizarCategoria(this.categoriaActual.id, this.categoriaActual).subscribe({
        next: () => { this.cargarCategorias(); this.cerrarModal(); },
        error: () => alert('Error al actualizar la categoría.')
      });
    } else {
      this.conductorService.crearCategoria(this.categoriaActual).subscribe({
        next: () => { this.cargarCategorias(); this.cerrarModal(); },
        error: () => alert('Error al crear la categoría.')
      });
    }
  }

// 1. Definimos las categorías que son "intocables" (Protección de sistema)
readonly CATEGORIAS_PROTEGIDAS = ['P', 'A', 'B', 'C', 'M', 'T', 'Provisional'];

// 2. Modificamos la función de eliminar para que bloquee estas categorías
eliminarCategoria(id: number): void {
  const cat = this.categorias.find(c => c.id === id);
  
  if (cat && this.CATEGORIAS_PROTEGIDAS.includes(cat.nombre)) {
    alert(`⛔ Error de Seguridad: La '${cat.nombre}' es una categoría base de la normativa nacional y no puede ser eliminada.`);
    return;
  }

  if (confirm('¿Está seguro de eliminar esta categoría personalizada?')) {
    this.conductorService.eliminarCategoria(id).subscribe({
      next: () => this.categorias = this.categorias.filter(c => c.id !== id),
      error: () => alert('No se puede eliminar. Hay conductores asignados.')
    });
  }
}
}