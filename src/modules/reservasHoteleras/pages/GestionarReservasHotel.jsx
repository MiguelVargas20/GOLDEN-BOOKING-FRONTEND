import { useNavigate } from "react-router-dom";
import { BsPersonPlus } from "react-icons/bs";
import PanelReservasAdmin from "../../../shared/components/reservas/PanelReservasAdmin";
import {
  listarReservasHotelAdmin,
  obtenerResumenHotel,
  confirmarReservaHotel,
  cancelarReservaHotel,
  reprogramarReservaHotel,
} from "../api/ReservaHotelApi";
import { fecha, fechaHora, pesos } from "../../../shared/utils/formato";

/**
 * Panel del ADMIN: reservas hoteleras.
 * Toda reserva nueva llega PENDIENTE; aquí se aprueba o se cancela con motivo.
 */
export default function GestionarReservasHotel() {
  const navigate = useNavigate();

  const columnas = [
    {
      titulo: "Huésped",
      render: (r) => (
        <>
          <span className="gb-celda-principal">{r.nombreCliente || "—"}</span>
          <span className="gb-celda-secundaria">{r.correoCliente || `Doc. ${r.docUsuario}`}</span>
        </>
      ),
    },
    {
      titulo: "Habitación",
      render: (r) => (
        <>
          <span className="gb-celda-principal">N.º {r.numeroHabitacion || "—"}</span>
          <span className="gb-celda-secundaria">{r.tHabitacion || ""}</span>
        </>
      ),
    },
    {
      titulo: "Estadía",
      render: (r) => (
        <>
          <span className="gb-celda-principal">{fecha(r.fCheckIn)} → {fecha(r.fCheckOut)}</span>
          <span className="gb-celda-secundaria">{r.noch} {r.noch === 1 ? "noche" : "noches"}</span>
        </>
      ),
    },
    { titulo: "Total", render: (r) => <span className="gb-celda-principal">{pesos(r.pTotal)}</span> },
    {
      titulo: "Solicitada",
      render: (r) => (
        <>
          <span className="gb-celda-secundaria">{fechaHora(r.fechaSolicitud)}</span>
          {r.registradaPorAdministrador && <span className="gb-etiqueta-recepcion">Registrada en recepción</span>}
        </>
      ),
    },
  ];

  return (
    <PanelReservasAdmin
      titulo="Gestión de reservas"
      resaltado="hoteleras"
      subtitulo="Aprueba o cancela las solicitudes de hospedaje. Toda reserva nueva llega como pendiente."
      listar={listarReservasHotelAdmin}
      resumen={obtenerResumenHotel}
      confirmar={confirmarReservaHotel}
      cancelar={cancelarReservaHotel}
      reprogramar={reprogramarReservaHotel}
      datosReprogramacion={(r) => ({
        tipo: "HOTEL", id: r.idH, lugar: `Habitación ${r.numeroHabitacion} · ${r.nombreCliente || r.docUsuario}`,
        inicio: r.fCheckIn, fin: r.fCheckOut, precioNoche: r.pNoche,
      })}
      obtenerId={(r) => r.idH}
      columnas={columnas}
      detalles={(r) => ({
        Huésped: r.nombreCliente || r.docUsuario,
        Habitación: `N.º ${r.numeroHabitacion}`,
        Estadía: `${fecha(r.fCheckIn)} → ${fecha(r.fCheckOut)} (${r.noch} noches)`,
        Total: pesos(r.pTotal),
      })}
      textoBusqueda={(r) => [r.nombreCliente, r.correoCliente, r.docUsuario, r.numeroHabitacion, r.tHabitacion].join(" ")}
      accionesExtra={
        // Solo acciones de reservas: la administración de habitaciones vive en Servicios → Habitaciones
        <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/recepcion/nueva-reserva?tipo=hotel")}>
          <BsPersonPlus /> Reservar para un cliente
        </button>
      }
    />
  );
}
