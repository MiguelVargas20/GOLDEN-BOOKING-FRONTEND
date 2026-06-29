// ═══════════════════════════════════════════════════════════
// ── Configuración Global y Autenticación ───────────────────
// ═══════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ═══════════════════════════════════════════════════════════
// ── Habitaciones ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

/**
 * Obtiene la lista completa de habitaciones (Sin paginación para evitar errores con .map()).
 * @returns {Promise<Array>} Lista de habitaciones.
 */
export const listarHabitaciones = async () => {
  const res = await fetch(`${API_URL}/api/habitaciones`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar habitaciones");
  return data;
};

/**
 * Obtiene una lista de todas las habitaciones que se encuentran disponibles.
 * @returns {Promise<Array>} Lista de habitaciones disponibles.
 */
export const listarHabitacionesDisponibles = async () => {
  const res = await fetch(`${API_URL}/api/habitaciones/disponibles`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar habitaciones disponibles");
  return data;
};

/**
 * Obtiene los detalles de una habitación específica por su ID.
 * @param {string|number} id - Identificador de la habitación.
 * @returns {Promise<Object>} Datos de la habitación solicitada.
 */
export const obtenerHabitacionPorId = async (id) => {
  const res = await fetch(`${API_URL}/api/habitaciones/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Habitación no encontrada");
  return data;
};

/**
 * Crea una nueva habitación en el sistema.
 * @param {Object} dto - Objeto con los datos de la nueva habitación.
 * @returns {Promise<Object>} La habitación creada por el servidor.
 */
export const crearHabitacion = async (dto) => {
  const res = await fetch(`${API_URL}/api/habitaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear habitación");
  return data;
};

/**
 * Actualiza los datos de una habitación existente.
 * @param {string|number} id - Identificador de la habitación a actualizar.
 * @param {Object} dto - Objeto con los datos actualizados.
 * @returns {Promise<Object>} La habitación actualizada.
 */
export const actualizarHabitacion = async (id, dto) => {
  const res = await fetch(`${API_URL}/api/habitaciones/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al actualizar habitación");
  return data;
};

/**
 * Elimina una habitación del sistema por su ID.
 * @param {string|number} id - Identificador de la habitación a eliminar.
 * @returns {Promise<boolean>} Retorna true si se eliminó con éxito.
 */
export const eliminarHabitacion = async (id) => {
  const res = await fetch(`${API_URL}/api/habitaciones/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar habitación");
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
  const res = await fetch(`${API_URL}/api/tipohabitaciones`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar tipos de habitación");
  return data;
};

/**
 * Obtiene un tipo de habitación específico mediante su ID.
 * @param {string|number} id - Identificador del tipo de habitación.
 * @returns {Promise<Object>}
 */
export const obtenerTipoHabitacionPorId = async (id) => {
  const res = await fetch(`${API_URL}/api/tipohabitaciones/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Tipo de habitación no encontrado");
  return data;
};

/**
 * Registra un nuevo tipo de habitación en el sistema.
 * @param {Object} dto
 * @returns {Promise<Object>}
 */
export const crearTipoHabitacion = async (dto) => {
  const res = await fetch(`${API_URL}/api/tipohabitaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear tipo de habitación");
  return data;
};

/**
 * Modifica los datos de un tipo de habitación existente.
 * @param {string|number} id
 * @param {Object} dto
 * @returns {Promise<Object>}
 */
export const actualizarTipoHabitacion = async (id, dto) => {
  const res = await fetch(`${API_URL}/api/tipohabitaciones/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al actualizar tipo de habitación");
  return data;
};

/**
 * Elimina un tipo de habitación del sistema.
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export const eliminarTipoHabitacion = async (id) => {
  const res = await fetch(`${API_URL}/api/tipohabitaciones/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar tipo de habitación");
  return true;
};