const API_URL = `${import.meta.env.VITE_API_URL}/api/reservas/deporte`;

// Crear reserva (POST)
export const crearReservaDeporte = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data),
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw {
      message: responseJson.message || "Error al crear la reserva",
      errors: responseJson.errors || null,
    };
  }
  return responseJson;
};

// Listar todas las reservas (GET) — para ADMIN
export const listarReservasDeporte = async (page = 0, size = 10) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" }
  });
  const responseJson = await response.json();
  if (!response.ok) throw new Error("No se pudieron cargar las reservas");
  return responseJson;
};

// Listar reservas del usuario logueado (GET) — para CLIENTE
export const listarMisReservasDeporte = async (userId) => {
  const token = localStorage.getItem("token");

  // Pedimos todas las páginas o una página grande para filtrar las del usuario
  const response = await fetch(`${API_URL}?page=0&size=100`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error("Error al cargar reservas");

  // Extraer el array del objeto paginado
  const lista = Array.isArray(data) ? data : (data.contenido || []);

  return lista.filter(r => r.docUsuario === userId);
};

// Cancelar reserva (PATCH)
export const cancelarReservaDeporte = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/${id}/cancelar`, {
    method: "PATCH",
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });

  if (!response.ok) {
    // Intentar leer el mensaje de error del back
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || "No se pudo cancelar la reserva");
    } catch {
      throw new Error("No se pudo cancelar la reserva");
    }
  }
  return true;
};
