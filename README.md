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
- `/login` — Inicio de sesión
- `/register` — Registro de usuario
- `/home` — Página principal (requiere login)
- `/reservas-deportivas` — Módulo de reservas deportivas
- `/reservas-hospedaje` — Módulo de reservas hoteleras
- `/usuarios` — Gestión de usuarios (solo ADMIN)
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
│   ├── auth/                # Login, registro, recuperar/restablecer contraseña, verificar cuenta
│   │   ├── api/  pages/  schemas/  styles/
│   ├── home/                # Página de inicio
│   ├── usuarios/            # Gestión de usuarios (ADMIN) y "Mi perfil"
│   │   ├── api/  pages/  styles/
│   ├── reservasDeportivas/  # Catálogo, reservar espacio, mis reservas, gestión (ADMIN)
│   │   ├── api/  hooks/  pages/  styles/
│   ├── reservasHoteleras/   # Habitaciones, tipos, reservas de hotel
│   │   ├── api/  pages/  styles/  utils/
│   └── mensajes/            # Contacto, mis mensajes, bandeja del ADMIN
│       ├── api/  hooks/  pages/  styles/
└── shared/                  # Lo que usan varios módulos
    ├── api/                 # apiUtils (URL base, headers, manejo de errores)
    ├── components/          # Navbar, Footer, RutaProteccion, LoadingSpinner
    ├── context/             # AuthContext, ThemeContext
    ├── hooks/               # useRequirePerfilCompleto
    ├── layout/              # Layout principal (Navbar + contenido + Footer)
    ├── styles/              # Tema, modo oscuro, botones y datepicker compartidos
    └── utils/               # escapeHtml
```

**Regla:** si algo solo lo usa un módulo, va dentro de ese módulo; si lo usan dos
o más, va en `shared/`.
