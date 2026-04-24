import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../services/cliente';
import { UsuarioService, Usuario } from '../../services/usuario';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  usuarios: Usuario[] = [];
  usuariosDisponibles: Usuario[] = [];
  
  cargando = true;
  mostrarModal = false;
  modoModal: 'crear' | 'editar' | 'ver' = 'crear';
  
  clienteActual: Cliente | any = {}; 
  baseMediaUrl = 'http://localhost:8000';

  constructor(
    private clienteService: ClienteService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  // 1. Cargamos Usuarios PRIMERO, luego Clientes para evitar carreras asíncronas
  cargarDatosIniciales(): void {
    this.cargando = true;
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (dataUsuarios) => {
        this.usuarios = dataUsuarios;
        this.cargarClientes();
      },
      error: (err) => { console.error('Error usuarios:', err); this.cargando = false; }
    });
  }

  cargarClientes(): void {
    this.clienteService.obtenerClientes().subscribe({
      next: (dataClientes) => { 
        this.clientes = dataClientes; 
        this.cargarUsuariosFiltrados(); 
        this.cargando = false; 
      },
      error: (err) => { console.error('Error clientes:', err); this.cargando = false; }
    });
  }

  // 2. Filtramos: Solo rol 'Cliente' y que no estén en la tabla clientes
  cargarUsuariosFiltrados(): void {
    this.usuariosDisponibles = this.usuarios.filter(user => {
      const tieneRolCorrecto = user.rol_detalles?.nombre_rol === 'Cliente';
      const yaTienePerfil = this.clientes.some(cliente => cliente.usuario === user.id);
      return tieneRolCorrecto && !yaTienePerfil;
    });
  }

  abrirModalCrear(): void {
    this.modoModal = 'crear';
    this.clienteActual = { 
      usuario: null, tipo_cliente: 'Empresa', razon_social: '', nit: '', 
      direccion_fiscal: '', contacto_principal: '', telefono_principal: '' 
    };
    this.mostrarModal = true;
  }
  editarCliente(cliente: Cliente): void {
    this.modoModal = 'editar';
    this.clienteActual = { ...cliente };
    this.mostrarModal = true;
  }

  verCliente(cliente: Cliente): void {
    this.modoModal = 'ver';
    this.clienteActual = { ...cliente };
    this.mostrarModal = true;
  }

  cerrarModal(): void { 
    this.mostrarModal = false; 
  }

  guardarCliente(): void {
    if (this.modoModal === 'editar' && this.clienteActual.id) {
      this.clienteService.actualizarCliente(this.clienteActual.id, this.clienteActual).subscribe({
        next: () => { this.cargarDatosIniciales(); this.cerrarModal(); },
        error: (err) => alert('Error al actualizar el cliente.')
      });
    } else {
      this.clienteService.crearCliente(this.clienteActual).subscribe({
        next: () => { this.cargarDatosIniciales(); this.cerrarModal(); },
        error: (err) => alert('Error al guardar. Verifica que el usuario no sea ya un cliente.')
      });
    }
  }

  eliminarCliente(id: number | undefined): void {
    if (id && confirm('¿Estás seguro de eliminar este perfil de cliente? (El usuario seguirá existiendo)')) {
      this.clienteService.eliminarCliente(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter(c => c.id !== id);
          this.cargarUsuariosFiltrados(); 
        },
        error: (err) => alert('No se puede eliminar porque este cliente ya tiene rutas asignadas.')
      });
    }
  }

  obtenerImagenUrl(url: string | undefined): string {
    if (!url) return 'assets/images/icono.png';
    return url.startsWith('http') ? url : `${this.baseMediaUrl}${url}`;
  }
}