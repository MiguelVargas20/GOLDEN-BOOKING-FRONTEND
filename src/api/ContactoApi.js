const API_URL = `${import.meta.env.VITE_API_URL}/api/contacto`;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Envía un mensaje de contacto.
 * @param {Object} data - { nombre, correo, contenido }
 */
export const enviarMensaje = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw {
      message: json.error || json.message || "No se pudo enviar el mensaje",
      errores: json.errores || null,
    };
  }
  return json;
};

/**
 * Lista los mensajes de contacto (ADMIN).
 */
export const listarMensajes = async (page = 0, size = 10) => {
  const res = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error("No se pudieron cargar los mensajes");
  return json;
};

/**
 * Marca un mensaje como leído (ADMIN).
 */
export const marcarMensajeLeido = async (id) => {
  const res = await fetch(`${API_URL}/${id}/leido`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error("No se pudo actualizar el mensaje");
  return json;
};