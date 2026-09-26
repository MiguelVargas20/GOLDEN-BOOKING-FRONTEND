# Golden Booking — Frontend

## Requisitos
- Node.js 18+
- npm o yarn

## Instalación
```bash
npm install
```

## Configuración
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:8080
```

## Correr en desarrollo
```bash
npm run dev
```

## Build para producción
```bash
npm run build
```

## Rutas principales
| Ruta | Quién | Qué es |
|---|---|---|
| `/login`, `/register`, `/forgot` | Todos | Acceso, registro y recuperación de contraseña |
| `/home` | Todos | **Admin:** panel de control (dashboard). **Cliente:** portada |
| `/reservas-deportivas` | Todos | Catálogo de espacios deportivos y reserva por horas |
| `/reservas-deportivas/mis-reservas` | Todos | Mis reservas deportivas: cancelar, cambiar la fecha y calificar las finalizadas |
| `/habitaciones`, `/habitaciones/:id` | Todos | Catálogo y detalle de habitaciones, reserva por noches |
| `/reservas-hoteleras/mis-reservas` | Todos | Mis reservas hoteleras: cancelar, cambiar la fecha y calificar las finalizadas |
| `/mi-perfil`, `/mis-mensajes`, `/contactos` | Todos | Perfil, mensajes y contacto |
| `/reservas-deportivas/gestionar`, `/reservas-hoteleras/gestionar` | Admin | Aprobar, cancelar (con motivo) o reprogramar solicitudes y ver el historial de cada reserva |
| `/calendario` | Admin | Calendario semanal de ocupación por habitación y espacio |
| `/reportes` | Admin | Reservas e ingresos por rango de fechas, descargables en Excel y PDF |
| `/recepcion/nueva-reserva` | Admin | Registrar una reserva a nombre de un cliente |
| `/reservas-deportivas/espacios` | Admin | Administrar espacios deportivos e imágenes |
| `/habitaciones/gestionar`, `/habitaciones/crear`, `/habitaciones/tipos` | Admin | Administrar habitaciones, imágenes y tipos |
| `/usuarios`, `/usuarios-crear`, `/usuarios-edit` | Admin | Administrar usuarios y roles |
| `/mensajes` | Admin | Bandeja de mensajes de contacto |

El cliente tiene una **campana de notificaciones** (reserva aprobada, cancelada, reprogramada, vencida o lista para calificar) y los catálogos muestran el **promedio de estrellas** de cada espacio y habitación.

## Pruebas de extremo a extremo (Cypress)
Las pruebas están en `cypress/e2e` y **simulan el backend** con `cy.intercept`, así que no hace falta tener el servidor ni MongoDB: solo el frontend.

```bash
npm run dev          # terminal 1: el frontend en http://localhost:5173
npm run test:e2e     # terminal 2: corre todas las pruebas sin ventana
npm run cypress      # o abre Cypress para verlas paso a paso
```

| Archivo | Flujo que prueba |
|---|---|
| `01-login` | Validaciones, credenciales incorrectas, ingreso del admin, rutas protegidas, recuperar contraseña |
| `02-registro` | Validaciones, contraseñas distintas, registro completo, error del servidor |
| `03-navbar` | Menú del admin y del cliente, campana de respuestas, cerrar sesión |
| `04-reserva-deportiva-cliente` | Catálogo, filtro, reservar con horario, hora local, error 409, cancelar |
| `05-reservas-deportivas-admin` | Aprobar, cancelar con motivo, filtros, búsqueda; crear/editar espacios y cambiar estado |
| `06-reserva-hotel-cliente` | Catálogo, orden por precio, reservar desde el detalle, fechas cruzadas, motivo de cancelación |
| `07-reservas-hotel-admin` | Listado, aprobar, cancelar con motivo, ir a recepción |
| `08-habitaciones-admin` | Crear con imagen, imagen pequeña, validaciones, editar, eliminar; CRUD de tipos |
| `09-usuarios-admin` | Listado y búsqueda, crear admin, editar (estado y documento), eliminar |
| `10-perfil` | Ver y guardar el perfil, error del servidor |
| `11-mensajes` | Enviar mensaje, validaciones, ver respuesta, responder y filtrar en la bandeja |
| `12-dashboard` | Indicadores, periodo, error y reintento, portada del cliente |
| `13-recepcion` | Buscar cliente, reservar a su nombre confirmada, cliente inactivo |
| `14-reprogramar` | Cambiar fecha (deporte y hotel), error 409, cancelada sin opción, admin reprograma |
| `15-notificaciones` | Contador, lista, abrir y marcar leída, marcar todas, vacío, admin sin campana |
| `16-historial` | Quién creó/aprobó/reprogramó y cuándo; reservas antiguas reconstruidas |
| `17-calificaciones` | Calificar finalizada, ya calificada, solo finalizadas, promedio en catálogo, opiniones |
| `18-calendario` | Noches por habitación, horarios por espacio, semana siguiente, cliente sin acceso |
| `19-reportes` | Mes actual, rango elegido, rangos rápidos, descarga Excel/PDF, error del servidor |

Los datos simulados están en `cypress/support/datos.js` y los comandos propios (`visitarComo`, `simularApiBase`, `confirmarDialogo`) en `cypress/support/commands.js`.

## Estructura del proyecto
El código está organizado **por módulo** (cada funcionalidad tiene sus propias
páginas, estilos, llamadas a la API y hooks) y una carpeta `shared/` con lo que
usan varios módulos.

```
src/
├── App.jsx                  # Rutas de la aplicación
├── main.jsx                 # Punto de entrada (providers + estilos globales)
├── index.css
├── assets/                  # Imágenes
├── modules/
│   ├── auth/                # Login, registro, recuperar/restablecer contraseña, verificar cuenta (LayoutAuth)
│   ├── home/                # Inicio: portada (cliente) o dashboard (admin)
│   ├── dashboard/           # Panel de control del admin: indicadores, agenda, pendientes, gráficos
│   ├── usuarios/            # Gestión de usuarios (admin) y "Mi perfil"
│   ├── reservasDeportivas/  # Espacios, catálogo, reservar, mis reservas y gestión (admin)
│   ├── habitaciones/        # Catálogo, detalle, gestión, crear y tipos de habitación
│   ├── reservasHoteleras/   # Mis reservas y gestión de reservas de hotel (admin)
│   ├── recepcion/           # Reservar a nombre de un cliente (admin)
│   └── mensajes/            # Contacto, mis mensajes y bandeja del admin
└── shared/                  # Lo que usan varios módulos
    ├── api/                 # apiUtils (URL base, headers, manejo de errores y sesión)
    ├── components/          # Navbar, Footer, RutaProteccion, SelectorImagen, paneles de reservas
    ├── context/             # AuthContext, ThemeContext
    ├── hooks/               # Pendientes, avisos en vivo del admin, eventos de reservas
    ├── layout/              # Layout principal (Navbar + contenido + Footer)
    ├── styles/              # Tema (claro/oscuro), paneles, catálogos, botones y calendarios
    └── utils/               # Fechas en hora local, formatos (es-CO), imágenes, escapeHtml
```

**Regla:** si algo solo lo usa un módulo, va dentro de ese módulo; si lo usan dos
o más, va en `shared/`.
