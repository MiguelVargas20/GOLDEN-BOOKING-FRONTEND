import React from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";

function Crear() {
    const navigate = useNavigate();
    const location = useLocation();
    const espacio = location.state?.espacio || "";

    console.log(location.state);
    console.log(espacio);
    console.log(espacio.length);

    return (
        <div className="crear-espacio-container">
            <h2 className="titulo">CREAR {espacio === "d" ? "ESPACIO DEPORTIVO" : (espacio === "h" ? "HABITACION" : "")}</h2>

            <div className="contenido">
                {/* Área de carga */}
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

                    {
                        espacio === "d" ?
                    <select className="input">
                        <option>Categoría</option>
                        <option>Fútbol</option>
                        <option>Baloncesto</option>
                        <option>Tenis</option>
                    </select>
                        :
                        <textarea className="input" placeholder="Descripción" rows="4"></textarea>
                    }

                    <div className="botones">
                        <button className="btn btn-crear crear" onClick={() => navigate("/reservas-deportivas")}>CREAR</button>
                        <button className="btn btn-crear cancelar" onClick={() => navigate("/reservas-deportivas")}>CANCELAR</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Crear;
