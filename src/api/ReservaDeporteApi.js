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
// ANTES: pedía 100 reservas de todos y filtraba en el navegador
export const listarMisReservasDeporte = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/mis-reservas`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error al cargar reservas");
  return data; // ya viene filtrado y seguro desde el backend
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
