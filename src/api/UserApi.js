const API_URL = `${import.meta.env.VITE_API_URL}/api/usuarios`;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
});

// Listar todos los usuarios (ADMIN)
export const listarUsuarios = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error("Error al cargar usuarios");
  return data;
};

// Obtener usuario por ID
export const obtenerUsuarioPorId = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error("Usuario no encontrado");
  return data;
};

// Actualizar usuario (ADMIN)
export const actualizarUsuario = async (id, data) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Error al actualizar");
  return json;
};

// Eliminar usuario (ADMIN)
export const eliminarUsuario = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!response.ok) throw new Error("Error al eliminar usuario");
  return true;
};                                          // ← cierre correcto aquí

// Actualizar perfil propio (CLIENTE o ADMIN)
export const actualizarMiPerfil = async (id, datos) => {
  const res = await fetch(`${API_URL}/${id}/perfil`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(datos)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al actualizar perfil");
  return data;
};