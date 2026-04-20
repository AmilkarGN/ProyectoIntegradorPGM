import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario';
import { RolService } from '../../services/rol';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'] // (Asumiendo que así se llama tu CSS)
})
export class Register implements OnInit {
  
  verContrasena = false;
  verConfirmarContrasena = false;
  cargando = false;
  errorMsg = '';

  // El objeto donde guardaremos lo que el usuario escriba
  registroData = {
    nombre: '',
    apellido_paterno: '',
    ci: '',
    celular: '',
    email: '',
    username: '',
    password: '',
    confirmarPassword: ''
  };

  // Aquí guardaremos el ID secreto del rol "Cliente"
  rolClienteId: number | undefined;

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cuando carga la pantalla, buscamos el ID del rol "Cliente"
    this.rolService.obtenerRoles().subscribe({
      next: (roles) => {
        const rolCliente = roles.find(r => r.nombre_rol === 'Cliente');
        if (rolCliente) {
          this.rolClienteId = rolCliente.id;
        } else {
          console.error('ALERTA: No existe el rol "Cliente" en la base de datos.');
        }
      }
    });
  }

  toggleContrasena() { this.verContrasena = !this.verContrasena; }
  toggleConfirmarContrasena() { this.verConfirmarContrasena = !this.verConfirmarContrasena; }

  registrarCuenta() {
    this.errorMsg = '';

    // Validaciones básicas
    if (this.registroData.password !== this.registroData.confirmarPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.registroData.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (!this.rolClienteId) {
      this.errorMsg = 'Error del servidor: Rol de cliente no configurado. Contacte soporte.';
      return;
    }

    this.cargando = true;

    // Armamos el paquete para Django (Igual que en el CRUD)
    const formData = new FormData();
    formData.append('username', this.registroData.username);
    formData.append('email', this.registroData.email);
    formData.append('nombre', this.registroData.nombre);
    formData.append('apellido_paterno', this.registroData.apellido_paterno);
    formData.append('ci', this.registroData.ci);
    formData.append('celular', this.registroData.celular);
    formData.append('password', this.registroData.password);
    
    // INYECCIÓN AUTOMÁTICA DEL ROL CLIENTE (El usuario nunca elige esto)
    formData.append('rol_id', this.rolClienteId.toString());
    formData.append('is_active', 'true');

    // Enviamos a guardar
    this.usuarioService.crearUsuario(formData).subscribe({
      next: () => {
        this.cargando = false;
        alert('¡Bienvenido a TransKelion! Tu cuenta ha sido creada con éxito. Ya puedes iniciar sesión.');
        this.router.navigate(['/login']); // Lo mandamos al login
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = 'No se pudo crear la cuenta. Es posible que el Usuario o el CI ya estén registrados.';
        console.error('Error de registro:', err);
      }
    });
  }
}