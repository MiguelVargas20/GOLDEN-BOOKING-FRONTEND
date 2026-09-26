import { useNavigate } from "react-router-dom";
import { BsPlusLg } from "react-icons/bs";
import ListaMisReservas from "../../../shared/components/reservas/ListaMisReservas";
import { listarMisReservasDeporte, cancelarReservaDeporte, reprogramarReservaDeporte } from "../api/ReservaDeporteApi";
import { fecha, hora, pesos } from "../../../shared/utils/formato";

/** "Mis reservas" deportivas del cliente. */
function ReservasDSolicitadas() {
  const navigate = useNavigate();

  const columnas = [
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
  ];

  return (
    <ListaMisReservas
      titulo="Mis reservas"
      resaltado="deportivas"
      categoria="DEPORTE"
      cargar={listarMisReservasDeporte}
      cancelar={cancelarReservaDeporte}
      reprogramar={reprogramarReservaDeporte}
      datosReprogramacion={(r) => ({
        tipo: "DEPORTE", id: r.idD, lugar: r.tCancha, inicio: r.fInicioReserva, fin: r.fFinReserva, espacioId: r.espacioId,
      })}
      obtenerId={(r) => r.idD}
      columnas={columnas}
      detalles={(r) => ({
        Espacio: r.tCancha,
        Fecha: `${fecha(r.fInicioReserva)} · ${hora(r.fInicioReserva)} – ${hora(r.fFinReserva)}`,
      })}
      textoVacio="No tienes reservas deportivas aún. ¡Reserva tu primer espacio desde el catálogo!"
      accionesExtra={
        <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/reservas-deportivas")}>
          <BsPlusLg /> Nueva reserva
        </button>
      }
    />
  );
}

export default ReservasDSolicitadas;
