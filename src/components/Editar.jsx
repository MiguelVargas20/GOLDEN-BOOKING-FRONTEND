import React from "react";
import { FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Editar() {
    const navigate = useNavigate();

    return (
        <div className="editar-container">
            <h2 className="titulo">EDITAR ESPACIO DEPORTIVO</h2>

            <div className="card-editar">
                <div className="card-header">
                    EDITAR ESPACIO DEPORTIVO
                </div>

                <div className="card-body">
                    {/* Área imagen */}
                    <div className="upload-box">
                        <FaUpload className="upload-icon" />
                    </div>

                    {/* Formulario */}
                    <div className="formulario">
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="input"
                        />

                        <select className="input">
                            <option>No. Personas</option>
                            {Array.from({ length: 15 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>

                        <select className="input">
                            <option>Categoría</option>
                            <option>Fútbol</option>
                            <option>Baloncesto</option>
                            <option>Tenis</option>
                            <option>Piscina</option>
                        </select>

                        <div className="botones">
                            <button
                                className="btn-editar aceptar-editar"
                                onClick={() => navigate("/reservas-deportivas")}
                            >
                                ACEPTAR
                            </button>

                            <button
                                className="btn-editar cancelar-editar"
                                onClick={() => navigate("/reservas-deportivas")}
                            >
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Editar;
