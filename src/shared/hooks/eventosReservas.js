// Evento del navegador para avisar "las reservas cambiaron" entre partes de
// la app que no se conocen (Navbar, dashboard, paneles de gestión).
// Lo disparan: el aviso en vivo del WebSocket y las acciones de aprobar /
// cancelar. Quien lo escucha vuelve a pedir sus datos.

export const EVENTO_RESERVAS_CAMBIARON = "gb:reservas-cambiaron";

export const avisarReservasCambiaron = (detalle = null) =>
  window.dispatchEvent(new CustomEvent(EVENTO_RESERVAS_CAMBIARON, { detail: detalle }));
