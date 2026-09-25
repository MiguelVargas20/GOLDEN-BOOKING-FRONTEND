import { useNavigate } from "react-router-dom";
import { BsGrid, BsPersonPlus } from "react-icons/bs";
import PanelReservasAdmin from "../../../shared/components/reservas/PanelReservasAdmin";
import {
  listarReservasDeporte,
  obtenerResumenDeporte,
  confirmarReservaDeporte,
  cancelarReservaDeporte,
} from "../api/ReservaDeporteApi";
import { fechaHora, fecha, hora, pesos } from "../../../shared/utils/formato";

/**
 * Panel del ADMIN: reservas deportivas.
 * Toda reserva nueva llega PENDIENTE; aquí se aprueba o se cancela con motivo.
 */
export default function GestionarReservas() {
  const navigate = useNavigate();

  const columnas = [
    {
      titulo: "Cliente",
      render: (r) => (
        <>
          <span className="gb-celda-principal">{r.nombreCliente || "—"}</span>
          <span className="gb-celda-secundaria">{r.correoCliente || `Doc. ${r.docUsuario}`}</span>
        </>
      ),
    },
    {
      titulo: "Espacio",
      render: (r) => (
        <>
          <span className="gb-celda-principal">{r.tCancha}</span>
          {(r.implAlquilados || r.rqrEntrenador) && (
            <span className="gb-celda-secundaria">
              {[r.implAlquilados, r.rqrEntrenador ? "Con entrenador" : null].filter(Boolean).join(" · ")}
            </span>
          )}
        </>
      ),
    },
    {
      titulo: "Fecha y horario",
      render: (r) => (
        <>
          <span className="gb-celda-principal">{fecha(r.fInicioReserva)}</span>
          <span className="gb-celda-secundaria">{hora(r.fInicioReserva)} – {hora(r.fFinReserva)}</span>
        </>
      ),
    },
    { titulo: "Total", render: (r) => <span className="gb-celda-principal">{pesos(r.pr)}</span> },
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
      resaltado="deportivas"
      subtitulo="Aprueba o cancela las solicitudes de los clientes. Toda reserva nueva llega como pendiente."
      listar={listarReservasDeporte}
      resumen={obtenerResumenDeporte}
      confirmar={confirmarReservaDeporte}
      cancelar={cancelarReservaDeporte}
      obtenerId={(r) => r.idD}
      columnas={columnas}
      detalles={(r) => ({
        Cliente: r.nombreCliente || r.docUsuario,
        Espacio: r.tCancha,
        Fecha: `${fecha(r.fInicioReserva)} · ${hora(r.fInicioReserva)} – ${hora(r.fFinReserva)}`,
        Total: pesos(r.pr),
      })}
      textoBusqueda={(r) => [r.nombreCliente, r.correoCliente, r.docUsuario, r.tCancha].join(" ")}
      accionesExtra={
        <>
          <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/recepcion/nueva-reserva?tipo=deporte")}>
            <BsPersonPlus /> Reservar para un cliente
          </button>
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/reservas-deportivas/espacios")}>
            <BsGrid /> Espacios
          </button>
        </>
      }
    />
  );
}
