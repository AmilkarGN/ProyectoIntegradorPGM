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

  // --- VARIABLES PARA EL MODAL DE ALERTA/CONFIRMACIÓN ---
  mostrarAlerta = false;
  alertaConfig: {
    tipo: 'error' | 'success' | 'warning' | 'confirmacion';
    titulo: string;
    mensaje: string;
    textoBotonAceptar?: string;
    textoBotonCancelar?: string;
  } = { tipo: 'warning', titulo: '', mensaje: '' };
  
  // Guardamos la acción pendiente si es una confirmación
  accionConfirmacion: (() => void) | null = null;

  constructor(
    private conductorService: ConductorService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.cargando = true;
    this.conductorService.obtenerCategorias().subscribe(c => this.categorias = c);
    
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (dataUsuarios) => {
        this.usuarios = dataUsuarios;
        this.cargarConductores();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.abrirAlerta('error', 'Error de Carga', 'No se pudieron cargar los usuarios disponibles.');
        this.cargando = false;
      }
    });
  }

  cargarConductores(): void {
    this.conductorService.obtenerConductores().subscribe({
      next: (dataConductores) => { 
        this.conductores = dataConductores; 
        this.cargarUsuariosFiltrados(); 
        this.cargando = false; 
      },
      error: (err) => { 
        console.error('Error al cargar conductores:', err); 
        this.abrirAlerta('error', 'Error de Carga', 'No se pudieron cargar los datos de los conductores.');
        this.cargando = false; 
      }
    });
  }

  cargarUsuariosFiltrados(): void {
    this.usuariosDisponibles = this.usuarios.filter(user => {
      const tieneRolCorrecto = user.rol_detalles?.nombre_rol === 'Conductor';
      const yaTienePerfil = this.conductores.some(conductor => conductor.usuario === user.id);
      return tieneRolCorrecto && !yaTienePerfil;
    });
  }

  // --- MÉTODOS DEL MODAL PRINCIPAL ---
  abrirModalCrear(): void {
    this.modoModal = 'crear';
    this.conductorActual = { 
      usuario: null, 
      nro_licencia: '', 
      categoria_licencia: null, 
      fecha_emision_licencia: '', 
      vencimiento_licencia: '',
      fecha_nacimiento: '', 
      direccion: '', 
      grupo_sanguineo: '',
      contacto_emergencia_nombre: '', 
      contacto_emergencia_telefono: '',
      disponible: true // Campo necesario para Django
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

  // --- LÓGICA DE GUARDADO MEJORADA (Con validación y sanitización) ---
guardarConductor(form: any): void {
    if (form.invalid) {
      this.abrirAlerta('warning', 'Formulario Incompleto', 'Por favor, llena todos los campos obligatorios marcados con asterisco (*).');
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
      return; 
    }

    const categoriaSeleccionada = this.categorias.find(c => c.id === Number(this.conductorActual.categoria_licencia));
    
    if (categoriaSeleccionada && categoriaSeleccionada.edad_minima) {
      const edadConductor = this.calcularEdad(this.conductorActual.fecha_nacimiento);
      
      // 👇 NUEVA VALIDACIÓN: Bloquea a los "viajeros del tiempo"
      if (edadConductor < 0) {
        this.abrirAlerta('error', 'Fecha de Nacimiento Inválida', 'La fecha seleccionada está en el futuro. Verifica el año de nacimiento.');
        return; // Detenemos todo aquí
      }
      
      if (edadConductor < categoriaSeleccionada.edad_minima) {
        this.abrirAlerta(
          'confirmacion',
          '⚠️ Alerta de Normativa',
          `La ${categoriaSeleccionada.nombre} exige una edad mínima de ${categoriaSeleccionada.edad_minima} años.<br><br>El conductor seleccionado tiene <strong>${edadConductor} años.</strong><br><br>¿Desea asignar esta licencia bajo su responsabilidad administrativa?`,
          'Sí, Asignar',
          'Cancelar'
        );
        this.accionConfirmacion = () => {
          this.ejecutarGuardado();
        };
        return; 
      }
    }
    
    this.ejecutarGuardado();
  }

  // Sanitiza los datos y los envía a Django
  private ejecutarGuardado(): void {
    const payload = { ...this.conductorActual };

    // TRUCO DE SANITIZACIÓN: Django rechaza strings vacíos en opciones fijas
    if (payload.grupo_sanguineo === '') payload.grupo_sanguineo = null;
    if (payload.usuario) payload.usuario = Number(payload.usuario);
    if (payload.categoria_licencia) payload.categoria_licencia = Number(payload.categoria_licencia);

    if (this.modoModal === 'editar' && payload.id) {
      this.conductorService.actualizarConductor(payload.id, payload).subscribe({
        next: () => { 
          this.cargarDatosIniciales(); 
          this.cerrarModal(); 
          this.abrirAlerta('success', '¡Éxito!', 'Perfil de conductor actualizado correctamente.');
        },
        error: (err) => this.mostrarErrorBackend(err)
      });
    } else {
      this.conductorService.crearConductor(payload).subscribe({
        next: () => { 
          this.cargarDatosIniciales(); 
          this.cerrarModal(); 
          this.abrirAlerta('success', '¡Éxito!', 'Nuevo conductor registrado correctamente.');
        },
        error: (err) => this.mostrarErrorBackend(err)
      });
    }
  }

  // Procesa los errores exactos que devuelve Django
  private mostrarErrorBackend(err: any): void {
    let msg = 'Verifica los datos proporcionados.';
    
    if (err.error && typeof err.error === 'object') {
      const errores = Object.values(err.error).flat();
      if (errores.length > 0) {
        msg = errores.join('<br>');
      }
    }
    
    this.abrirAlerta('error', 'Error del Servidor', msg);
  }

  // --- LÓGICA DE ELIMINACIÓN ---
  eliminarConductor(id: number | undefined): void {
    if (id) {
      this.abrirAlerta(
        'confirmacion',
        '¿Eliminar Perfil?',
        '¿Estás seguro de eliminar este perfil de conductor? (El usuario base seguirá existiendo en el sistema).',
        'Sí, Eliminar',
        'Cancelar'
      );
      
      this.accionConfirmacion = () => {
        this.conductorService.eliminarConductor(id).subscribe({
          next: () => {
            this.conductores = this.conductores.filter(c => c.id !== id);
            this.cargarUsuariosFiltrados();
            this.abrirAlerta('success', 'Eliminado', 'El perfil ha sido removido exitosamente.');
          },
          error: (err) => {
            console.error('Error:', err);
            this.abrirAlerta('error', 'Error', 'No se pudo eliminar el perfil.');
          }
        });
      };
    }
  }

  // --- CONTROLADOR DEL MODAL DE ALERTA ---
  abrirAlerta(tipo: 'error' | 'success' | 'warning' | 'confirmacion', titulo: string, mensaje: string, btnAceptar = 'Aceptar', btnCancelar = 'Cancelar') {
    this.alertaConfig = { tipo, titulo, mensaje, textoBotonAceptar: btnAceptar, textoBotonCancelar: btnCancelar };
    this.mostrarAlerta = true;
  }

  cerrarAlerta() {
    this.mostrarAlerta = false;
    this.accionConfirmacion = null;
  }

  aceptarConfirmacion() {
    this.mostrarAlerta = false;
    if (this.accionConfirmacion) {
      this.accionConfirmacion();
      this.accionConfirmacion = null;
    }
  }

  obtenerImagenUrl(url: string | undefined): string {
    if (!url) return 'assets/images/icono.png';
    return url.startsWith('http') ? url : `${this.baseMediaUrl}${url}`;
  }
}