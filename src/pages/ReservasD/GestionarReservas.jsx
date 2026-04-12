import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import { listarReservasDeporte, cancelarReservaDeporte } from "../../api/ReservaDeporteApi";

function GestionarReservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState(null);

  // Función para capitalizar texto (ej: estado de reserva)
  const capitalizar = (texto) =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : "—";

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const data = await listarReservasDeporte();
      setReservas(data);
    } catch (err) {
      setError("No se pudieron cargar las reservas");
      console.error(err);
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm("¿Deseas cancelar esta reserva?")) {
      try {
        await cancelarReservaDeporte(id);
        obtenerDatos();
      } catch (err) {
        alert("Error al cancelar la reserva");
      }
    }
  };

  return (
    <div className="reservas-container">
      <div className="reservas-header d-flex justify-content-between align-items-center mb-4">
        <h2>GESTIÓN DE RESERVAS (MONGO DB)</h2>
        <button className="btn btn-primary" onClick={() => navigate("/reservas-deportivas")}>
          <FaPlus /> NUEVA
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {reservas.length === 0 ? (
        <div className="alert alert-info">No hay reservas registradas.</div>
      ) : (
        <div className="tabla-container">
          <table className="table table-hover shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>USUARIO</th>
                <th>CANCHA</th>
                <th>INICIO</th>
                <th>FIN</th>
                <th>PRECIO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.idD}>
                  {/* ← campos corregidos según lo que devuelve el back */}
                  <td title={r.docUsuario}>
                      {r.docUsuario ? r.docUsuario.slice(-6) : "—"}
                  </td>
                  <td><span className="badge bg-info text-dark">{capitalizar(r.tCancha)}</span></td>
                  <td>{r.fInicioReserva ? new Date(r.fInicioReserva).toLocaleString() : "-"}</td>
                  <td>{r.fFinReserva ? new Date(r.fFinReserva).toLocaleString() : "-"}</td>
                  <td>${r.pr?.toLocaleString() || 0}</td>
                  <td>
                    <span className={`badge ${r.estado === "CANCELADA" ? "bg-danger" : r.estado === "CONFIRMADA" ? "bg-success" : "bg-warning text-dark"}`}>
                      {r.estado || "PENDIENTE"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleCancelar(r.idD)}
                      disabled={r.estado === "CANCELADA"}
                    >
                      <FaTrash /> Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GestionarReservas;