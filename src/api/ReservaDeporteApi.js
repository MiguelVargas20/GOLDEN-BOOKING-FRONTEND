const API_URL = "http://127.0.0.1:8080/api/reservas/deporte";

// Función para crear reserva (POST)
export const crearReservaDeporte = async (data) => {
  const token = localStorage.getItem("token"); // Por si manejas seguridad

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "" // Opcional: si el back lo pide
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

// Función para listar todas (GET)
export const listarReservasDeporte = async () => {
  const response = await fetch(API_URL);
  const responseJson = await response.json();

  if (!response.ok) throw new Error("No se pudieron cargar las reservas");
  
  return responseJson;
};

// Función para cancelar (PATCH)
export const cancelarReservaDeporte = async (id) => {
  const response = await fetch(`${API_URL}/${id}/cancelar`, {
    method: "PATCH",
  });

  if (!response.ok) throw new Error("No se pudo cancelar la reserva");
  
  return true;
};