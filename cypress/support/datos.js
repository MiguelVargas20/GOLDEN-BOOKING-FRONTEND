// Datos de prueba: respuestas simuladas del backend (mismo formato que los DTO).
// Las pruebas no dependen de un servidor ni de una base de datos reales.

/** JWT de mentira: la app solo lee "exp" para saber si la sesión sigue viva. */
export const tokenFalso = (usuario) => {
  const b64 = (o) => btoa(JSON.stringify(o));
  return `${b64({ alg: "HS256" })}.${b64({ sub: usuario, exp: Math.floor(Date.now() / 1000) + 3600 })}.firma`;
};

export const SESIONES = {
  admin: {
    id: "a1", usuario: "admin", nombreCompleto: "Ana Admin", roles: ["ROL_ADMIN"],
    documento: { tipo: "CC", numero: "1012345678" },
  },
  cliente: {
    id: "c1", usuario: "laura", nombreCompleto: "Laura Pérez", roles: ["ROL_CLIENTE"],
    documento: { tipo: "CC", numero: "52123456" },
  },
};

export const perfil = (rol) => ({
  id: SESIONES[rol].id,
  nombre: rol === "admin" ? "Ana" : "Laura",
  apellido: rol === "admin" ? "Admin" : "Pérez",
  email: rol === "admin" ? "admin@goldenbooking.com" : "laura@correo.com",
  telefono: "3001234567",
  documento: { tipo: "CC", numeroD: SESIONES[rol].documento.numero },
  direccion: { cll: "45", crr: "12 # 34-56", cd: "Bogotá", ps: "Colombia" },
  fechaNacimiento: "1995-05-10",
  fechaRegistro: "2026-01-15T10:00:00",
  estado: "ACTIVO",
  roles: SESIONES[rol].roles,
});

/** Fecha local "yyyy-MM-dd" dentro de N días (las reservas deben ser futuras). */
export const enDias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** "yyyy-MM-dd" → "dd/MM/yyyy" (lo que se escribe en los calendarios). */
export const aDMY = (iso) => iso.split("-").reverse().join("/");

export const pagina = (contenido) => ({
  contenido, paginaActual: 0, totalPaginas: 1, totalElementos: contenido.length,
});

// ── Espacios deportivos ─────────────────────────────────────
export const espacios = [
  {
    id: "e1", nombre: "Cancha de Tenis 1", deporte: "Tenis", descripcion: "Polvo de ladrillo",
    tarifaHora: 40000, capacidad: 4, horaApertura: "06:00:00", horaCierre: "22:00:00", estado: "ACTIVO", imagenUrl: null,
  },
  {
    id: "e2", nombre: "Cancha de Pádel", deporte: "Pádel", descripcion: "Cubierta",
    tarifaHora: 60000, capacidad: 4, horaApertura: "07:00:00", horaCierre: "21:00:00", estado: "MANTENIMIENTO", imagenUrl: null,
  },
];

export const reservaDeporte = (extra = {}) => ({
  idD: "rd1", tCancha: "Cancha de Tenis 1", espacioId: "e1", docUsuario: "52123456",
  nombreCliente: "Laura Pérez", correoCliente: "laura@correo.com",
  fInicioReserva: `${enDias(10)}T10:00:00`, fFinReserva: `${enDias(10)}T11:00:00`,
  pr: 40000, estado: "PENDIENTE", implAlquilados: "Raquetas", rqrEntrenador: false,
  fechaSolicitud: `${enDias(0)}T08:30:00`,
  ...extra,
});

// ── Habitaciones ────────────────────────────────────────────
export const tipos = [
  { id: "t1", nombreTipoHabitacion: "Suite", capacidadMaxima: 4, descripcion: "Vista al lago" },
  { id: "t2", nombreTipoHabitacion: "Doble", capacidadMaxima: 2, descripcion: "Dos camas" },
];

const tipoHab = { id: "t1", nomTipo: "Suite", cap: 4, desc: "Vista al lago" };
export const habitaciones = [
  { id: "h1", numeroHabitacion: "101", precioNoche: 180000, estadoHabitacion: "DISPONIBLE", datosTipoHabitacion: tipoHab, descripcion: "Cama king", imagenUrl: null },
  { id: "h2", numeroHabitacion: "102", precioNoche: 150000, estadoHabitacion: "MANTENIMIENTO", datosTipoHabitacion: tipoHab, descripcion: "Cama doble", imagenUrl: null },
];

export const reservaHotel = (extra = {}) => ({
  idH: "rh1", idHabitacion: "h1", numeroHabitacion: "101", tHabitacion: "Suite", docUsuario: "52123456",
  nombreCliente: "Laura Pérez", correoCliente: "laura@correo.com",
  fCheckIn: `${enDias(20)}T15:00:00`, fCheckOut: `${enDias(22)}T12:00:00`, noch: 2, pTotal: 360000,
  estado: "PENDIENTE", fechaSolicitud: `${enDias(0)}T09:00:00`,
  ...extra,
});

// ── Usuarios y mensajes ─────────────────────────────────────
export const usuariosLista = [
  { id: "a1", nombre: "Ana", apellido: "Admin", email: "admin@goldenbooking.com", telefono: "3001234567", documento: { tipo: "CC", numeroD: "1012345678" }, estado: "ACTIVO", roles: ["ROL_ADMIN"], fechaNacimiento: "1990-01-01", direccion: { cll: "", crr: "", cd: "Bogotá", ps: "Colombia" } },
  { id: "c1", nombre: "Laura", apellido: "Pérez", email: "laura@correo.com", telefono: "3109876543", documento: { tipo: "CC", numeroD: "52123456" }, estado: "ACTIVO", roles: ["ROL_CLIENTE"], fechaNacimiento: "1995-05-10", direccion: { cll: "45", crr: "12", cd: "Medellín", ps: "Colombia" } },
];

export const mensaje = (extra = {}) => ({
  id: "m1", nombre: "Laura Pérez", correo: "laura@correo.com", contenido: "¿Tienen parqueadero para huéspedes?",
  fechaEnvio: `${enDias(0)}T08:00:00`, leido: false, respuesta: null,
  ...extra,
});

// ── Dashboard ───────────────────────────────────────────────
export const dashboard = () => ({
  fecha: enDias(0),
  generadoEn: `${enDias(0)}T09:00:00`,
  periodoDias: 14,
  indicadores: {
    reservasDeporteHoy: 3, checkInsHoy: 1, checkOutsHoy: 1,
    pendientesDeporte: 1, pendientesHotel: 1,
    habitacionesTotal: 2, habitacionesOcupadas: 1, habitacionesMantenimiento: 1, habitacionesReservadasPendientes: 0,
    ingresosMes: 1500000, ingresosMesAnterior: 1200000, mensajesNoLeidos: 2,
  },
  agendaHoy: [],
  pendientes: [
    { tipo: "DEPORTE", idReserva: "rd1", cliente: "Laura Pérez", lugar: "Cancha de Tenis 1", inicio: `${enDias(1)}T10:00:00`, fin: `${enDias(1)}T11:00:00`, total: 40000 },
  ],
  habitaciones: [],
  tendencia: [],
  espaciosTop: [],
});

// ── Funciones nuevas: historial, notificaciones, calendario, reportes ────
export const historial = [
  { accion: "CREADA", fecha: `${enDias(0)}T08:30:00`, usuario: "laura", rol: "CLIENTE" },
  { accion: "CONFIRMADA", fecha: `${enDias(0)}T09:15:00`, usuario: "admin", rol: "ADMINISTRADOR" },
  { accion: "REPROGRAMADA", fecha: `${enDias(0)}T10:00:00`, usuario: "admin", rol: "ADMINISTRADOR", detalle: "Horario anterior: 12/10/2026 10:00 a. m." },
];

export const notificaciones = [
  { id: "n1", tipo: "RESERVA_APROBADA", categoria: "HOTEL", idReserva: "rh1", titulo: "Reserva aprobada",
    mensaje: "Tu reserva de la habitación 101 fue aprobada. ¡Te esperamos!", fecha: `${enDias(0)}T09:00:00`, leida: false },
  { id: "n2", tipo: "RESERVA_CANCELADA", categoria: "DEPORTE", idReserva: "rd1", titulo: "Reserva cancelada",
    mensaje: "La administración canceló tu reserva de Cancha de Tenis 1. Motivo: Mantenimiento", fecha: `${enDias(0)}T08:00:00`, leida: false },
  { id: "n3", tipo: "CALIFICAR", categoria: "DEPORTE", idReserva: "rd9", titulo: "¿Cómo te fue?",
    mensaje: "Califica Cancha de Tenis 1: tu opinión nos ayuda a mejorar.", fecha: `${enDias(-1)}T20:00:00`, leida: true },
];

/** Lunes de la semana actual como "yyyy-MM-dd" (el calendario empieza en lunes). */
export const lunesActual = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const calendario = (desde) => {
  const p = (x) => String(x).padStart(2, "0");
  const dia = (n) => {
    const d = new Date(`${desde}T00:00:00`);
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  return {
    desde, hasta: dia(6),
    espacios: [
      { id: "e1", nombre: "Cancha de Tenis 1", detalle: "Tenis", estado: "ACTIVO", horaApertura: "06:00:00", horaCierre: "22:00:00",
        reservas: [
          { idReserva: "rd1", cliente: "Laura Pérez", inicio: `${dia(1)}T10:00:00`, fin: `${dia(1)}T11:00:00`, estado: "CONFIRMADA" },
          { idReserva: "rd2", cliente: "Pedro Gómez", inicio: `${dia(1)}T16:00:00`, fin: `${dia(1)}T17:30:00`, estado: "PENDIENTE" },
        ] },
    ],
    habitaciones: [
      { id: "h1", nombre: "Habitación 101", detalle: "Suite", estado: "DISPONIBLE",
        reservas: [{ idReserva: "rh1", cliente: "Laura Pérez", inicio: `${dia(2)}T15:00:00`, fin: `${dia(4)}T12:00:00`, estado: "CONFIRMADA" }] },
      { id: "h2", nombre: "Habitación 102", detalle: "Suite", estado: "MANTENIMIENTO", reservas: [] },
    ],
  };
};

export const reporte = (desde, hasta) => ({
  desde, hasta, generadoEn: `${enDias(0)}T09:00:00`,
  resumen: {
    totalReservas: 3, reservasDeporte: 2, reservasHotel: 1,
    porEstado: { PENDIENTE: 1, CONFIRMADA: 1, CANCELADA: 0, FINALIZADA: 1 },
    ingresos: 400000, ingresosDeporte: 40000, ingresosHotel: 360000,
  },
  filas: [
    { categoria: "HOTEL", idReserva: "rh1", cliente: "Laura Pérez", documento: "52123456", lugar: "Habitación 101",
      inicio: `${desde}T15:00:00`, fin: `${desde}T12:00:00`, estado: "FINALIZADA", total: 360000, registradaEnRecepcion: false },
    { categoria: "DEPORTE", idReserva: "rd1", cliente: "Pedro Gómez", documento: "80123456", lugar: "Cancha de Tenis 1",
      inicio: `${desde}T10:00:00`, fin: `${desde}T11:00:00`, estado: "CONFIRMADA", total: 40000, registradaEnRecepcion: true },
    { categoria: "DEPORTE", idReserva: "rd2", cliente: "Laura Pérez", documento: "52123456", lugar: "Cancha de Tenis 1",
      inicio: `${desde}T16:00:00`, fin: `${desde}T17:00:00`, estado: "PENDIENTE", total: 40000, registradaEnRecepcion: false },
  ],
});

// ── Socios, consumos y eventos ──────────────────────────────
const BENEFICIOS = {
  ocasional: { descuento: 5, diasAnticipacion: 120, otrosBeneficios: "Reserva con más anticipación." },
  miembro: { descuento: 10, diasAnticipacion: 365, otrosBeneficios: "Cuenta de socio para pagar a fin de mes." },
};

/** Lo que devuelve /api/membresias/mia (por defecto: cliente sin membresía). */
export const miMembresia = (extra = {}) => ({
  membresia: "NINGUNA", descuento: 0, diasAnticipacion: 60, otrosBeneficios: null,
  reservas: 3, reservasParaSugerir: 5, ...BENEFICIOS, ...extra,
});

export const configMembresia = () => ({ id: "config", reservasParaSugerir: 5, diasAnticipacionGeneral: 60, ...BENEFICIOS });

export const socios = [
  { idUsuario: "c1", nombre: "Laura Pérez", documento: "52123456", email: "laura@correo.com", membresia: "NINGUNA", fechaMembresia: null, reservas: 6, sugerido: true },
  { idUsuario: "c2", nombre: "Pedro Gómez", documento: "80123456", email: "pedro@correo.com", membresia: "MIEMBRO", fechaMembresia: `${enDias(-30)}T10:00:00`, reservas: 12, sugerido: false },
  { idUsuario: "c3", nombre: "Marta Ruiz", documento: "41234567", email: "marta@correo.com", membresia: "NINGUNA", fechaMembresia: null, reservas: 1, sugerido: false },
];

export const cargo = (extra = {}) => ({
  id: "cg1", docUsuario: "52123456", nombreCliente: "Laura Pérez", concepto: "Agua", categoria: "RESTAURANTE",
  cantidad: 2, valorUnitario: 4000, total: 8000, destino: "RESERVA_HOTEL", idReserva: "rh1",
  descripcionDestino: "Habitación 101 · 20 oct → 22 oct", estado: "PENDIENTE", fecha: `${enDias(0)}T12:00:00`,
  registradoPor: "admin", fechaPago: null, ...extra,
});

export const cuentaCliente = (cargos = [cargo()], extra = {}) => ({
  docUsuario: "52123456", nombreCliente: "Laura Pérez", membresia: "MIEMBRO",
  totalPendiente: cargos.filter((c) => c.estado === "PENDIENTE").reduce((s, c) => s + c.total, 0),
  destinos: [
    { destino: "RESERVA_HOTEL", idReserva: "rh1", descripcion: "Habitación 101 · 20 oct → 22 oct" },
    { destino: "CUENTA_SOCIO", idReserva: null, descripcion: "Cuenta de socio (pago a fin de mes)" },
  ],
  cargos, ...extra,
});

export const evento = (extra = {}) => ({
  id: "ev1", titulo: "Noche de salsa", descripcion: "Orquesta en vivo y clase gratis.", categoria: "BAILE",
  fechaInicio: `${enDias(7)}T19:00:00`, fechaFin: `${enDias(7)}T23:00:00`, lugar: "Salón principal",
  cupo: 120, precio: 0, publicado: true, imagenUrl: null, nuevo: true, fechaCreacion: `${enDias(0)}T08:00:00`,
  ...extra,
});
