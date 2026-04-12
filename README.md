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