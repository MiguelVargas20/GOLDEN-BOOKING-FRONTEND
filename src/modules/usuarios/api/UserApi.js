import { authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

const API_URL = `${import.meta.env.VITE_API_URL}/api/usuarios`;

// Listar todos los usuarios (ADMIN)
export const listarUsuarios = async (page = 0, size = 10) => {
  const response = await apiFetch(`${API_URL}?page=${page}&size=${size}`, {
    headers: authHeaders()
  });
  if (!response.ok) throw new Error(await extraerMensajeError(response, "Error al cargar usuarios"));
  return response.json();
};

// Buscar un usuario por su número de documento (ADMIN).
// Lo usa la pantalla de recepción para reservar a nombre de un cliente.
export const obtenerUsuarioPorDocumento = async (documento) => {
  const response = await apiFetch(`${API_URL}/doc/${encodeURIComponent(documento)}`, {
    headers: authHeaders()
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(response.status === 404
      ? "No hay ningún cliente registrado con ese documento."
      : data.error || "No se pudo buscar el cliente.");
  }
  return data;
};

// Actualizar usuario (ADMIN)
export const actualizarUsuario = async (id, data) => {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  // extraerMensajeError también lee los errores de validación campo por campo
  if (!response.ok) throw new Error(await extraerMensajeError(response, "No se pudo actualizar el usuario"));
  return response.json();
};

// Eliminar usuario (ADMIN)
export const eliminarUsuario = async (id) => {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!response.ok) throw new Error(await extraerMensajeError(response, "Error al eliminar usuario"));
  return true;
};                                          // ← cierre correcto aquí

// Actualizar perfil propio (CLIENTE o ADMIN)
export const actualizarMiPerfil = async (id, datos) => {
  const res = await apiFetch(`${API_URL}/perfil/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(datos)
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al actualizar perfil"));
  return res.json();
};
// Crear usuario desde el panel (ADMIN): con el rol elegido y ya verificado
export const crearUsuarioAdmin = async (datos, rol = "ROL_CLIENTE") => {
  const response = await apiFetch(`${API_URL}?rol=${encodeURIComponent(rol)}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  if (!response.ok) throw new Error(await extraerMensajeError(response, "No se pudo crear el usuario"));
  return response.json();
};
