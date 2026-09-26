import Swal from "sweetalert2";
import { escapeHtml } from "../../utils/escapeHtml";
import { fechaHora } from "../../utils/formato";

const ACCIONES = {
  CREADA: { texto: "Solicitada", clase: "creada" },
  CONFIRMADA: { texto: "Aprobada", clase: "confirmada" },
  CANCELADA: { texto: "Cancelada", clase: "cancelada" },
  REPROGRAMADA: { texto: "Reprogramada", clase: "reprogramada" },
  FINALIZADA: { texto: "Finalizada", clase: "finalizada" },
  VENCIDA: { texto: "Venció sin aprobarse", clase: "cancelada" },
  CALIFICADA: { texto: "Calificada", clase: "calificada" },
};
const ROLES = { ADMINISTRADOR: "administración", CLIENTE: "cliente", SISTEMA: "automático" };

/**
 * Eventos del historial de una reserva. Las reservas creadas antes de que
 * existiera el historial se reconstruyen con las fechas que sí guardaban.
 */
export function eventosDe(reserva) {
  if (reserva.historial?.length) return reserva.historial;
  const eventos = [];
  if (reserva.fechaSolicitud) {
    eventos.push({ accion: "CREADA", fecha: reserva.fechaSolicitud, rol: reserva.registradaPorAdministrador ? "ADMINISTRADOR" : "CLIENTE" });
  }
  if (reserva.fechaConfirmacion) eventos.push({ accion: "CONFIRMADA", fecha: reserva.fechaConfirmacion, rol: "ADMINISTRADOR" });
  if (reserva.fechaCancelacion) {
    eventos.push({
      accion: reserva.canceladaPor === "SISTEMA" ? "VENCIDA" : "CANCELADA",
      fecha: reserva.fechaCancelacion,
      rol: reserva.canceladaPor === "CLIENTE" ? "CLIENTE" : reserva.canceladaPor === "SISTEMA" ? "SISTEMA" : "ADMINISTRADOR",
      detalle: reserva.motivoCancelacion,
    });
  }
  return eventos;
}

/** Muestra el historial (quién hizo cada cambio y cuándo) en un diálogo. */
export function verHistorial(titulo, reserva) {
  const eventos = eventosDe(reserva);
  const html = eventos.length === 0
    ? "<p class='gb-swal-nota'>Esta reserva no tiene cambios registrados.</p>"
    : `<ol class="gb-historial">${eventos.map((e) => {
        const accion = ACCIONES[e.accion] || { texto: e.accion, clase: "creada" };
        const quien = e.usuario && e.usuario !== "sistema"
          ? `${escapeHtml(e.usuario)} (${ROLES[e.rol] || escapeHtml(e.rol || "")})`
          : ROLES[e.rol] || "—";
        return `<li class="gb-historial-${accion.clase}">
            <strong>${escapeHtml(accion.texto)}</strong>
            <span>${escapeHtml(fechaHora(e.fecha))} · ${quien}</span>
            ${e.detalle ? `<em>${escapeHtml(e.detalle)}</em>` : ""}
          </li>`;
      }).join("")}</ol>`;
  return Swal.fire({
    title: titulo,
    html,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#f38d1e",
    customClass: { popup: "gb-swal-historial" },
  });
}
