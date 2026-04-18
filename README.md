# FrontendLogistica

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


# 🚛 TransKelion - Sistema de Inteligencia Logística y Monitoreo

TransKelion es una plataforma SaaS diseñada para la gestión avanzada de rutas, control de viáticos, asignación de vehículos y monitoreo en tiempo real de flotas. El sistema integra módulos de inteligencia como la detección de fatiga del conductor para garantizar la seguridad en las operaciones logísticas.

## 🛠️ Stack Tecnológico

El proyecto utiliza una arquitectura separada (Frontend / Backend) para garantizar escalabilidad y rendimiento.

### Frontend (Cliente)
* **Framework:** Angular (v17.x.x) *(Reemplaza con tu versión exacta)*
* **Lenguaje:** TypeScript
* **Estilos:** CSS3 nativo con animaciones personalizadas (sin librerías pesadas)
* **Mapas:** Google Maps JavaScript API (con capas de Visualización/Heatmap)

### Backend (Servidor & API)
* **Framework Principal:** Django (v5.x.x) *(Reemplaza con tu versión exacta)*
* **API REST:** Django REST Framework (DRF)
* **Lenguaje:** Python (v3.11+)
* **Autenticación:** JWT (JSON Web Tokens) + 2FA (Verificación en 2 pasos por correo)

### Base de Datos
* **Motor:** PostgreSQL
* **ORM:** Django ORM

---

## 📋 Requisitos Previos (Prerequisites)

Para levantar este proyecto en tu entorno local, necesitas tener instalado:

1. **Node.js** (v18 o superior) y **npm** para el Frontend.
2. **Python** (v3.10 o superior) y **pip** para el Backend.
3. **PostgreSQL** instalado y corriendo localmente.
4. **Angular CLI** instalado globalmente (`npm install -g @angular/cli`).

---

## 🚀 Instalación y Ejecución Local

### 1. Levantar el Backend (Django)
Abre una terminal, navega a la carpeta del backend y ejecuta:

```bash
# Crear un entorno virtual (opcional pero recomendado)
python -m venv env
source env/Scripts/activate  # En Windows

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones a PostgreSQL
python manage.py migrate

# Iniciar el servidor de desarrollo (por defecto en el puerto 8000)
python manage.py runserver


# Instalar dependencias de Node
npm install

# Iniciar el servidor de desarrollo (por defecto en el puerto 4200)
ng serve