// ═══════════════════════════════════════════════════════════
// ── Configuración Global y Autenticación ───────────────────
// (centralizadas en apiUtils.js — ver ese archivo)
// ═══════════════════════════════════════════════════════════
import { authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

const API_URL = import.meta.env.VITE_API_URL;

// ═══════════════════════════════════════════════════════════
// ── Habitaciones ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

/**
 * Obtiene UNA página de habitaciones.
 *
 * Antes esta función no recibía parámetros: la gestión de habitaciones le
 * pasaba (pagina, tamaño) pero se ignoraban, así que el backend siempre
 * devolvía la página 0 con 10 elementos y los botones de paginación del
 * admin no hacían nada.
 *
 * @param {number} page - Número de página (empieza en 0).
 * @param {number} size - Elementos por página (el backend acepta máximo 100).
 * @returns {Promise<{contenido: Array, paginaActual: number, totalPaginas: number, totalElementos: number}>}
 */
export const listarHabitaciones = async (page = 0, size = 10) => {
  const res = await apiFetch(`${API_URL}/api/habitaciones?page=${page}&size=${size}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al cargar habitaciones"));
  return res.json();
};

/**
 * Obtiene TODAS las habitaciones recorriendo las páginas del backend.
 * La usa el catálogo de clientes: antes llamaba a listarHabitaciones() sin
 * parámetros y solo mostraba las primeras 10 habitaciones.
 * @returns {Promise<Array>} Lista completa de habitaciones.
 */
export const listarTodasLasHabitaciones = async () => {
  const TAMANIO = 100; // máximo que acepta el backend por página
  const primera = await listarHabitaciones(0, TAMANIO);
  let todas = [...(primera.contenido || [])];
  for (let pagina = 1; pagina < (primera.totalPaginas || 1); pagina++) {
    const siguiente = await listarHabitaciones(pagina, TAMANIO);
    todas = todas.concat(siguiente.contenido || []);
  }
  return todas;
};

/**
 * Obtiene los detalles de una habitación específica por su ID.
 * @param {string|number} id - Identificador de la habitación.
 * @returns {Promise<Object>} Datos de la habitación solicitada.
 */
export const obtenerHabitacionPorId = async (id) => {
  const res = await apiFetch(`${API_URL}/api/habitaciones/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Habitación no encontrada"));
  return res.json();
};

/**
 * Crea una nueva habitación en el sistema.
 * @param {Object} dto - Objeto con los datos de la nueva habitación.
 * @returns {Promise<Object>} La habitación creada por el servidor.
 */
export const crearHabitacion = async (dto) => {
  const res = await apiFetch(`${API_URL}/api/habitaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al crear habitación"));
  return res.json();
};

/**
 * Actualiza los datos de una habitación existente.
 * @param {string|number} id - Identificador de la habitación a actualizar.
 * @param {Object} dto - Objeto con los datos actualizados.
 * @returns {Promise<Object>} La habitación actualizada.
 */
export const actualizarHabitacion = async (id, dto) => {
  const res = await apiFetch(`${API_URL}/api/habitaciones/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al actualizar habitación"));
  return res.json();
};

/**
 * Elimina una habitación del sistema por su ID.
 * @param {string|number} id - Identificador de la habitación a eliminar.
 * @returns {Promise<boolean>} Retorna true si se eliminó con éxito.
 */
export const eliminarHabitacion = async (id) => {
  const res = await apiFetch(`${API_URL}/api/habitaciones/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al eliminar habitación"));
  return true;
};

// ═══════════════════════════════════════════════════════════
// ── Tipos de Habitación ────────────────────────────────────
// ═══════════════════════════════════════════════════════════

/**
 * Obtiene la lista de todos los tipos de habitación registrados.
 * @returns {Promise<Array>}
 */
export const listarTiposHabitacion = async () => {
  const res = await apiFetch(`${API_URL}/api/tipohabitaciones`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al cargar tipos de habitación"));
  return res.json();
};

/**
 * Registra un nuevo tipo de habitación en el sistema.
 * @param {Object} dto
 * @returns {Promise<Object>}
 */
export const crearTipoHabitacion = async (dto) => {
  const res = await apiFetch(`${API_URL}/api/tipohabitaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al crear tipo de habitación"));
  return res.json();
};

/**
 * Modifica los datos de un tipo de habitación existente.
 * @param {string|number} id
 * @param {Object} dto
 * @returns {Promise<Object>}
 */
export const actualizarTipoHabitacion = async (id, dto) => {
  const res = await apiFetch(`${API_URL}/api/tipohabitaciones/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al actualizar tipo de habitación"));
  return res.json();
};

/**
 * Elimina un tipo de habitación del sistema.
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export const eliminarTipoHabitacion = async (id) => {
  const res = await apiFetch(`${API_URL}/api/tipohabitaciones/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al eliminar tipo de habitación"));
  return true;
};