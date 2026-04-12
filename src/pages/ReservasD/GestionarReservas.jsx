import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa";
import { listarReservasDeporte, cancelarReservaDeporte } from "../../api/ReservaDeporteApi";

function GestionarReservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);

  // Cargar datos al montar el componente
  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const data = await listarReservasDeporte();
      setReservas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm("¿Deseas cancelar esta reserva?")) {
      await cancelarReservaDeporte(id);
      obtenerDatos(); // Refrescar tabla
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

      <div className="tabla-container">
        <table className="table table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>USUARIO</th>
              <th>CANCHA</th>
              <th>INICIO</th>
              <th>FIN</th>
              <th>PRECIO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.idD}>
                <td>{r.docUsuario}</td>
                <td><span className="badge bg-info text-dark">{r.tCancha}</span></td>
                <td>{new Date(r.fInicioReserva).toLocaleString()}</td>
                <td>{new Date(r.fFinReserva).toLocaleString()}</td>
                <td>${r.pr?.toLocaleString()}</td>
                <td>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleCancelar(r.idD)}
                  >
                    <FaTrash /> Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GestionarReservas;