import Swal from "sweetalert2";
import { escapeHtml } from "../../utils/escapeHtml";
import { avisarReservasCambiaron } from "../../hooks/eventosReservas";

// Diálogos de aprobación / cancelación compartidos por los paneles de reservas
// de hotel y deporte (y por "Mis reservas" del cliente).

const COLOR_PELIGRO = "#e53e3e";
const COLOR_NEUTRO = "#6c757d";
const LONGITUD_MINIMA_MOTIVO = 5; // igual que el backend

/** Lista "etiqueta: valor" escapada para el html de SweetAlert. */
const detalleHtml = (detalles) =>
  `<div class="gb-swal-detalle">${Object.entries(detalles)
    .map(([k, v]) => `<div><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`)
    .join("")}</div>`;

/**
 * Pide confirmación y aprueba la reserva.
 * @returns {Promise<boolean>} true si se aprobó.
 */
export async function aprobarReserva(detalles, accion) {
  const { isConfirmed } = await Swal.fire({
    title: "¿Aprobar esta reserva?",
    html: detalleHtml(detalles) + "<p class='gb-swal-nota'>Se enviará un correo de confirmación al cliente.</p>",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, aprobar",
    cancelButtonText: "Volver",
    confirmButtonColor: "#38a169",
    cancelButtonColor: COLOR_NEUTRO,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async () => {
      try {
        await accion();
      } catch (err) {
        Swal.showValidationMessage(err.message || "No se pudo aprobar la reserva.");
      }
    },
  });
  if (isConfirmed) {
    avisarReservasCambiaron(); // contadores de la Navbar y dashboard al día
    await Swal.fire({ title: "Reserva aprobada", icon: "success", timer: 1800, showConfirmButton: false });
  }
  return isConfirmed;
}

/**
 * Pide el motivo (obligatorio si cancela el admin) y cancela la reserva.
 * @param {Object} detalles - datos a mostrar en el diálogo
 * @param {Function} accion - recibe el motivo y llama a la API
 * @param {boolean} esAdmin - el admin debe escribir un motivo
 * @returns {Promise<boolean>} true si se canceló.
 */
export async function cancelarReserva(detalles, accion, esAdmin) {
  const { isConfirmed } = await Swal.fire({
    title: "¿Cancelar esta reserva?",
    html: detalleHtml(detalles) + (esAdmin
      ? "<p class='gb-swal-nota'>El motivo se le enviará al cliente por correo.</p>"
      : "<p class='gb-swal-nota'>Esta acción no se puede deshacer.</p>"),
    icon: "warning",
    input: "textarea",
    inputLabel: esAdmin ? "Motivo de la cancelación (obligatorio)" : "Motivo (opcional)",
    inputPlaceholder: esAdmin ? "Ej.: La cancha estará en mantenimiento ese día." : "Cuéntanos por qué cancelas (opcional)",
    inputAttributes: { maxlength: 300 },
    showCancelButton: true,
    confirmButtonText: "Sí, cancelar reserva",
    cancelButtonText: "Volver",
    confirmButtonColor: COLOR_PELIGRO,
    cancelButtonColor: COLOR_NEUTRO,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    inputValidator: (valor) => {
      if (esAdmin && (!valor || valor.trim().length < LONGITUD_MINIMA_MOTIVO)) {
        return `Escribe el motivo (mínimo ${LONGITUD_MINIMA_MOTIVO} caracteres).`;
      }
      return undefined;
    },
    preConfirm: async (motivo) => {
      try {
        await accion(motivo?.trim() || null);
      } catch (err) {
        Swal.showValidationMessage(err.message || "No se pudo cancelar la reserva.");
      }
    },
  });
  if (isConfirmed) {
    avisarReservasCambiaron(); // contadores de la Navbar y dashboard al día
    await Swal.fire({ title: "Reserva cancelada", icon: "success", timer: 1800, showConfirmButton: false });
  }
  return isConfirmed;
}

