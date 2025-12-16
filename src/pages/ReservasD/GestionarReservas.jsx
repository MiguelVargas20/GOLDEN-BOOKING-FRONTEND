import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlus, FaEye } from "react-icons/fa";

function GestionarReservas() {
  const navigate = useNavigate();
  const reservas = [
    { id: "001", persona: "Juan Pérez", nombre: "TENNIS 1", fecha: "10/12/2025", horario: "8:00 - 9:00 AM" },
    { id: "002", persona: "Ana Gómez", nombre: "FUTBOL 1", fecha: "10/12/2025", horario: "9:00 - 10:00 AM" },
    { id: "003", persona: "Carlos Ruiz", nombre: "BALONCESTO 1", fecha: "11/12/2025", horario: "10:00 - 11:00 AM" },
    { id: "004", persona: "María López", nombre: "TENNIS 2", fecha: "11/12/2025", horario: "1:00 - 3:00 PM" },
    { id: "005", persona: "Pedro Torres", nombre: "PISCINA 1", fecha: "12/12/2025", horario: "4:00 - 5:00 PM" },
    { id: "006", persona: "Laura Díaz", nombre: "PISCINA 2", fecha: "12/12/2025", horario: "3:00 - 4:00 PM" },
  ];

  return (
    <div className="reservas-container">
      {/* Header */}
      <div className="reservas-header">
        <div className="buscador">
          <input type="text" placeholder="Buscar" />
          <FaSearch />
        </div>

        <h2>INICIO - RESERVAS DEPORTIVAS</h2>

        <div className="acciones-header">
          <button className="btn-add-gestion" onClick={() => navigate('/reservas-deportivas/crear', {
                        state: {
                            espacio: "d"
                        }
                    })}>ADD</button>
          <FaPlus className="icon-plus" />
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>PERSONA</th>
              <th>RESERVA</th>
              <th>FECHA</th>
              <th>HORARIO</th>
              <th>OPCIONES</th>
            </tr>
          </thead>


          <tbody>
            {reservas.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.persona}</td>
                <td>{r.nombre}</td>
                <td>{r.fecha}</td>
                <td>{r.horario}</td>
                <td className="opciones">
                  <FaEye className="icon-view" />
                  <button className="btn-edit" onClick={() => navigate("/reservas-deportivas/editar")} >EDIT</button>
                  <button className="btn-delete">DELETE</button>
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
