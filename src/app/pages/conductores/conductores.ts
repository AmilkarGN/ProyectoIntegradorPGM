import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConductorService, Conductor, CategoriaLicencia } from '../../services/conductor';
import { UsuarioService, Usuario } from '../../services/usuario';

@Component({
  selector: 'app-conductores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conductores.html',
  styleUrls: ['../usuarios/usuarios.css'] 
})
export class ConductoresComponent implements OnInit {
  conductores: Conductor[] = [];
  usuarios: Usuario[] = [];
  categorias: CategoriaLicencia[] = [];
  
  cargando = true;
  mostrarModal = false;
  modoModal: 'crear' | 'editar' | 'ver' = 'crear';
  
  fechaHoy: string = new Date().toISOString().split('T')[0];
  usuariosDisponibles: Usuario[] = [];
  conductorActual: Conductor | any = {}; 
  baseMediaUrl = 'http://localhost:8000';

  constructor(
    private conductorService: ConductorService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.cargando = true;
    
    // 1. Cargamos las categorías
    this.conductorService.obtenerCategorias().subscribe(c => this.categorias = c);
    
    // 2. ¡AQUÍ ESTABA EL ERROR! Faltaba pedir los usuarios al backend
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (dataUsuarios) => {
        this.usuarios = dataUsuarios;
        // 3. SOLO cuando ya tenemos los usuarios, pedimos los conductores
        this.cargarConductores();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.cargando = false;
      }
    });
  }

  cargarConductores(): void {
    this.conductorService.obtenerConductores().subscribe({
      next: (dataConductores) => { 
        this.conductores = dataConductores; 
        
        // 4. Ahora sí, filtramos porque ya tenemos a los usuarios y a los conductores
        this.cargarUsuariosFiltrados(); 
        this.cargando = false; 
      },
      error: (err) => { 
        console.error('Error al cargar conductores:', err); 
        this.cargando = false; 
      }
    });
  }

  cargarUsuariosFiltrados(): void {
    this.usuariosDisponibles = this.usuarios.filter(user => {
      // Condición A: Que su rol en el sistema sea estrictamente 'Conductor'
      const tieneRolCorrecto = user.rol_detalles?.nombre_rol === 'Conductor';
      // Condición B: Que NO esté ya en la tabla de perfiles de conductor
      const yaTienePerfil = this.conductores.some(conductor => conductor.usuario === user.id);
      
      return tieneRolCorrecto && !yaTienePerfil;
    });
  }

  abrirModalCrear(): void {
    this.modoModal = 'crear';
    this.conductorActual = { 
      usuario: null, nro_licencia: '', categoria_licencia: null, 
      fecha_emision_licencia: '', vencimiento_licencia: '',
      fecha_nacimiento: '', direccion: '', grupo_sanguineo: '',
      contacto_emergencia_nombre: '', contacto_emergencia_telefono: ''
    };
    this.mostrarModal = true;
  }

  editarConductor(conductor: Conductor): void {
    this.modoModal = 'editar';
    this.conductorActual = { ...conductor };
    this.mostrarModal = true;
  }

  verConductor(conductor: Conductor): void {
    this.modoModal = 'ver';
    this.conductorActual = { ...conductor };
    this.mostrarModal = true;
  }

  cerrarModal(): void { 
    this.mostrarModal = false; 
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  guardarConductor(): void {
    const categoriaSeleccionada = this.categorias.find(c => c.id === Number(this.conductorActual.categoria_licencia));
    
    if (categoriaSeleccionada && categoriaSeleccionada.edad_minima) {
      const edadConductor = this.calcularEdad(this.conductorActual.fecha_nacimiento);
      
      if (edadConductor < categoriaSeleccionada.edad_minima) {
        const confirmar = confirm(
          `⚠️ ALERTA DE NORMATIVA:\n\n` +
          `La ${categoriaSeleccionada.nombre} exige una edad mínima de ${categoriaSeleccionada.edad_minima} años.\n` +
          `El conductor seleccionado tiene ${edadConductor} años.\n\n` +
          `¿Desea asignar esta licencia bajo su responsabilidad administrativa?`
        );
        
        if (!confirmar) return; 
      }
    }

    if (this.modoModal === 'editar' && this.conductorActual.id) {
      this.conductorService.actualizarConductor(this.conductorActual.id, this.conductorActual).subscribe({
        next: () => { this.cargarDatosIniciales(); this.cerrarModal(); },
        error: (err) => alert('Error al actualizar. Verifica los datos.')
      });
    } else {
      this.conductorService.crearConductor(this.conductorActual).subscribe({
        next: () => { this.cargarDatosIniciales(); this.cerrarModal(); },
        error: (err) => alert('Error al guardar. Verifica los datos o el número de licencia.')
      });
    }
  }

  eliminarConductor(id: number | undefined): void {
    if (id && confirm('¿Estás seguro de eliminar este perfil de conductor? (El usuario seguirá existiendo)')) {
      this.conductorService.eliminarConductor(id).subscribe({
        next: () => {
          this.conductores = this.conductores.filter(c => c.id !== id);
          this.cargarUsuariosFiltrados(); // Refrescamos el menú
        },
        error: (err) => console.error('Error:', err)
      });
    }
  }

  obtenerImagenUrl(url: string | undefined): string {
    if (!url) return 'assets/images/icono.png';
    return url.startsWith('http') ? url : `${this.baseMediaUrl}${url}`;
  }
}