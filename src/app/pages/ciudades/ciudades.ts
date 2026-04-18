import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CiudadService, Ciudad } from '../../services/ciudad';

declare const google: any;

@Component({
  selector: 'app-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ciudades.html',
  styleUrls: ['./ciudades.css']
})
export class CiudadesComponent implements OnInit {
  ciudades: Ciudad[] = [];
  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  
  ciudadActual: Ciudad = {
    nombre: '',
    region_estado: '',
    pais: 'Bolivia'
  };

  // 1. Apuntamos al input "Nombre de la Ciudad"
  @ViewChild('nombreCiudadInput') nombreCiudadInput!: ElementRef;

  constructor(private ciudadService: CiudadService) {}

  ngOnInit(): void {
    this.cargarCiudades();
  }

  cargarCiudades(): void {
    this.cargando = true;
    this.ciudadService.obtenerCiudades().subscribe({
      next: (data) => {
        this.ciudades = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener ciudades:', error);
        this.cargando = false;
      }
    });
  }


  // --- GOOGLE MAPS AUTOCOMPLETADO ---
  iniciarGoogleAutocomplete(): void {
    // Le damos 300ms a Angular para que termine de dibujar el Modal en la pantalla
    setTimeout(() => {
      // Buscamos el input directamente en el navegador por su ID
      const inputElement = document.getElementById('inputCiudad') as HTMLInputElement;

      if (inputElement) {
        const autocomplete = new google.maps.places.Autocomplete(inputElement, {
          types: ['(cities)'], 
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.address_components) return;

          this.mapearDatosGoogle(place.address_components);
        });
      } else {
        console.warn("TransKelion: Aún no se encuentra el input para Google Maps");
      }
    }, 300);
  }

  mapearDatosGoogle(componentes: any[]): void {
    let ciudad = '';
    let region = '';
    let pais = '';

    for (const component of componentes) {
      const type = component.types[0];
      if (type === 'locality' || type === 'administrative_area_level_2') {
        ciudad = component.long_name;
      } else if (type === 'administrative_area_level_1') {
        region = component.long_name;
      } else if (type === 'country') {
        pais = component.long_name;
      }
    }

    // 2. Al seleccionar, sobreescribimos los campos con los datos limpios de Google
    this.ciudadActual.nombre = ciudad;
    this.ciudadActual.region_estado = region;
    this.ciudadActual.pais = pais;
  }

  // --- MÉTODOS DEL MODAL Y CRUD ---
  abrirModal(): void {
    this.ciudadActual = { nombre: '', region_estado: '', pais: 'Bolivia' };
    this.mostrarFormulario = true;
    // 3. Encendemos Google Maps al abrir el modal
    this.iniciarGoogleAutocomplete();
  }

  cerrarModal(): void {
    this.mostrarFormulario = false;
  }

  editarCiudad(ciudad: Ciudad): void {
    this.ciudadActual = { ...ciudad };
    this.mostrarFormulario = true;
    this.iniciarGoogleAutocomplete();
  }

  guardarCiudad(): void {
    // Si Angular marca el formulario como inválido, el botón estará desactivado,
    // pero si por alguna razón entra aquí, este return detiene el proceso.
    if (!this.ciudadActual.nombre || !this.ciudadActual.region_estado || !this.ciudadActual.pais) {
      return; 
    }

    if (this.ciudadActual.id) {
      this.ciudadService.actualizarCiudad(this.ciudadActual.id, this.ciudadActual).subscribe({
        next: () => {
          this.cargarCiudades();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.ciudadService.crearCiudad(this.ciudadActual).subscribe({
        next: () => {
          this.cargarCiudades();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  eliminarCiudad(id: number | undefined): void {
    if (id && confirm('¿Estás seguro de que deseas eliminar esta ciudad?')) {
      this.ciudadService.eliminarCiudad(id).subscribe({
        next: () => {
          this.ciudades = this.ciudades.filter(c => c.id !== id);
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}