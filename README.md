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
| `/reservas-deportivas/mis-reservas` | Todos | Mis reservas deportivas |
| `/habitaciones`, `/habitaciones/:id` | Todos | Catálogo y detalle de habitaciones, reserva por noches |
| `/reservas-hoteleras/mis-reservas` | Todos | Mis reservas hoteleras |
| `/mi-perfil`, `/mis-mensajes`, `/contactos` | Todos | Perfil, mensajes y contacto |
| `/reservas-deportivas/gestionar`, `/reservas-hoteleras/gestionar` | Admin | Aprobar o cancelar solicitudes (con motivo) |
| `/recepcion/nueva-reserva` | Admin | Registrar una reserva a nombre de un cliente |
| `/reservas-deportivas/espacios` | Admin | Administrar espacios deportivos e imágenes |
| `/habitaciones/gestionar`, `/habitaciones/crear`, `/habitaciones/tipos` | Admin | Administrar habitaciones, imágenes y tipos |
| `/usuarios`, `/usuarios-crear`, `/usuarios-edit` | Admin | Administrar usuarios y roles |
| `/mensajes` | Admin | Bandeja de mensajes de contacto |

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
