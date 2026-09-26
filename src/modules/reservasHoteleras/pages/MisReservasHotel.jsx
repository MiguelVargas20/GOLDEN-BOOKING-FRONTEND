import { useNavigate } from "react-router-dom";
import { BsPlusLg } from "react-icons/bs";
import ListaMisReservas from "../../../shared/components/reservas/ListaMisReservas";
import { listarMisReservasHotel, cancelarReservaHotel } from "../api/ReservaHotelApi";
import { fecha, pesos } from "../../../shared/utils/formato";

/** "Mis reservas" hoteleras del cliente. */
export default function MisReservasHotel() {
  const navigate = useNavigate();

  const columnas = [
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
  ];

  return (
    <ListaMisReservas
      titulo="Mis reservas"
      resaltado="hoteleras"
      cargar={listarMisReservasHotel}
      cancelar={cancelarReservaHotel}
      obtenerId={(r) => r.idH}
      columnas={columnas}
      detalles={(r) => ({
        Habitación: `N.º ${r.numeroHabitacion}`,
        Estadía: `${fecha(r.fCheckIn)} → ${fecha(r.fCheckOut)}`,
      })}
      textoVacio="No tienes reservas hoteleras aún."
      accionesExtra={
        <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/habitaciones")}>
          <BsPlusLg /> Nueva reserva
        </button>
      }
    />
  );
}
