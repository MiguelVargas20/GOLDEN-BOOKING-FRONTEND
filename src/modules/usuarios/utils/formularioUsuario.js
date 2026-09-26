// Conversión entre los datos de un usuario (API) y el formulario del panel.

/** Usuario (API) → valores del formulario, todo como texto. */
export const aFormulario = (u = {}) => ({
  nombre: u.nombre || "",
  apellido: u.apellido || "",
  tipoDocumento: u.documento?.tipo || "CC",
  numeroDocumento: u.documento?.numeroD || "",
  fechaNacimiento: u.fechaNacimiento || "",
  email: u.email || "",
  telefono: u.telefono || "",
  calle: u.direccion?.cll || "",
  carrera: u.direccion?.crr || "",
  ciudad: u.direccion?.cd || "",
  pais: u.direccion?.ps || "Colombia",
  estado: u.estado || "ACTIVO",
  rol: u.roles?.includes("ROL_ADMIN") ? "ROL_ADMIN" : "ROL_CLIENTE",
  username: "",
  password: "",
});

/** Valores del formulario → cuerpo que espera el backend (sin estado/rol/credenciales). */
export const aDatosUsuario = (f) => ({
  nombre: f.nombre.trim(),
  apellido: f.apellido.trim(),
  documento: { tipo: f.tipoDocumento, numeroD: f.numeroDocumento.trim() },
  fechaNacimiento: f.fechaNacimiento || null, // input date → "YYYY-MM-DD" (LocalDate)
  email: f.email.trim(),
  telefono: f.telefono.trim(),
  direccion: { cll: f.calle.trim() || null, crr: f.carrera.trim() || null, cd: f.ciudad.trim(), ps: f.pais.trim() },
});
