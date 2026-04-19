import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolService, Rol } from '../../services/rol';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css']
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  
  // Roles que la interfaz no dejará borrar
  rolesProtegidos: string[] = ['Administrador', 'Gerente', 'Operador', 'Conductor', 'Cliente'];

  rolActual: Rol = {
    id: 0,
    nombre_rol: '',
    descripcion: ''
  };

  constructor(private rolService: RolService) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.cargando = true;
    this.rolService.obtenerRoles().subscribe({
      next: (data) => { this.roles = data; this.cargando = false; },
      error: (error) => { console.error('Error al obtener roles:', error); this.cargando = false; }
    });
  }

  abrirModal(): void {
    this.rolActual = { id: 0, nombre_rol: '', descripcion: '' };
    this.mostrarFormulario = true;
  }

  cerrarModal(): void {
    this.mostrarFormulario = false;
  }

  editarRol(rol: Rol): void {
    this.rolActual = { ...rol };
    this.mostrarFormulario = true;
  }

  guardarRol(): void {
    if (this.rolActual.id && this.rolActual.id > 0) {
      this.rolService.actualizarRol(this.rolActual.id, this.rolActual).subscribe({
        next: () => { 
          this.cargarRoles(); 
          this.cerrarModal(); 
        },
        error: (err) => console.error('Error al actualizar rol:', err)
      });
    } else {
      this.rolService.crearRol(this.rolActual).subscribe({
        next: () => { 
          this.cargarRoles(); 
          this.cerrarModal(); 
        },
        error: (err) => {
          console.error('Error al crear rol:', err);
          alert('Hubo un error. Verifica que el nombre del rol no exista ya.');
        }
      });
    }
  }

  eliminarRol(rol: Rol): void {
    if (this.rolesProtegidos.includes(rol.nombre_rol)) {
      alert(`El rol ${rol.nombre_rol} está protegido y no se puede borrar.`);
      return;
    }

    if (rol.id && confirm(`¿Estás seguro de eliminar el rol "${rol.nombre_rol}"?`)) {
      this.rolService.eliminarRol(rol.id).subscribe({
        next: () => { 
          this.roles = this.roles.filter(r => r.id !== rol.id); 
        },
        error: (err) => {
          console.error('Error al eliminar rol:', err);
          alert('No se pudo eliminar. Es posible que haya personal usando este rol en el sistema.');
        }
      });
    }
  }

  // --- AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA ---
  // Está justo antes de cerrar la clase, al mismo nivel que las otras funciones.
  esProtegido(nombre_rol: string): boolean {
    return this.rolesProtegidos.includes(nombre_rol);
  }

} // <-- Y aquí cierra el componente