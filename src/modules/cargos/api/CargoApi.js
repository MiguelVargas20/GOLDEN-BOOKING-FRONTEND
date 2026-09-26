import { API_URL, authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

const BASE_URL = `${API_URL}/api/cargos`;

const pedir = async (url, opciones, error) => {
  const res = await apiFetch(url, { headers: authHeaders(), ...opciones });
  if (!res.ok) throw new Error(await extraerMensajeError(res, error));
  return res.status === 204 ? null : res.json();
};

/** Consumos del cliente autenticado y su total pendiente. */
export const obtenerMiCuenta = () => pedir(`${BASE_URL}/mios`, {}, "No se pudieron cargar tus consumos.");

/** Estado de cuenta de un cliente (ADMIN): consumos, pendiente y destinos disponibles. */
export const obtenerCuentaCliente = (documento) =>
  pedir(`${BASE_URL}/cuenta/${encodeURIComponent(documento)}`, {}, "No se pudo cargar la cuenta del cliente.");

export const listarCargosPendientes = () => pedir(`${BASE_URL}/pendientes`, {}, "No se pudieron cargar los consumos pendientes.");

export const registrarCargo = (cargo) =>
  pedir(BASE_URL, { method: "POST", body: JSON.stringify(cargo) }, "No se pudo registrar el consumo.");

export const pagarCargo = (id) => pedir(`${BASE_URL}/${id}/pagar`, { method: "PATCH" }, "No se pudo registrar el pago.");

/** Cobra los pendientes: de una reserva (check-out), de la cuenta de socio o todos. */
export const pagarPendientesCliente = (documento, { idReserva, soloCuentaSocio } = {}) => {
  const params = new URLSearchParams();
  if (idReserva) params.append("idReserva", idReserva);
  if (soloCuentaSocio) params.append("soloCuentaSocio", "true");
  return pedir(`${BASE_URL}/cuenta/${encodeURIComponent(documento)}/pagar?${params}`, { method: "PATCH" }, "No se pudo registrar el pago.");
};

export const eliminarCargo = (id) => pedir(`${BASE_URL}/${id}`, { method: "DELETE" }, "No se pudo eliminar el consumo.");
