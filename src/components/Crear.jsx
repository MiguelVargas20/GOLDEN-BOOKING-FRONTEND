import React from "react";
// Se unificaron las importaciones de la misma librería para optimizar el código
import { useLocation, useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";

/**
 * Componente Crear
 * Renderiza un formulario dinámico para la creación de un Espacio Deportivo o una Habitación,
 * basándose en el estado transferido a través de la navegación por la ruta.
 */
function Crear() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Obtiene el tipo de espacio ('d' para deportivo, 'h' para habitación) desde el estado de la ruta
    const espacio = location.state?.espacio || "";

    // Logs de depuración en consola para verificar el estado recibido
    console.log(location.state);
    console.log(espacio);
    console.log(espacio.length);

    return (
        <div className="crear-espacio-container">
            {/* Título dinámico que cambia según el valor de la variable 'espacio' */}
            <h2 className="titulo">
                CREAR {espacio === "d" ? "ESPACIO DEPORTIVO" : (espacio === "h" ? "HABITACION" : "")}
            </h2>

            <div className="contenido">
                {/* Área de carga de archivos / imágenes */}
                <div className="upload-box">
                    <FaUpload className="upload-icon" />
                </div>

                {/* Formulario de captura de datos */}
                <div className="formulario">
                    {/* Campo para el nombre del espacio */}
                    <input
                        type="text"
                        placeholder="Nombre"
                        className="input"
                    />

                    {/* Selector de capacidad (Genera opciones del 1 al 15 dinámicamente) */}
                    <select className="input">
                        <option>Numero de Personas</option>
                        {Array.from({ length: 15 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>
                        ))}
                    </select>

                    {/* Renderizado condicional del tercer campo:
                        Si es espacio deportivo ('d'), muestra selector de categorías.
                        Si es cualquier otro (como habitación 'h'), muestra un área de descripción.
                    */}
                    {espacio === "d" ? (
                        <select className="input">
                            <option>Categoría</option>
                            <option>Fútbol</option>
                            <option>Baloncesto</option>
                            <option>Tenis</option>
                            <option>Golf</option>
                            <option>Piscina</option>
                            <option>Otra</option>
                        </select>
                    ) : (
                        <textarea 
                            className="input" 
                            placeholder="Descripción" 
                            rows="4"
                        ></textarea>
                    )}

                    {/* Botones de acción del formulario con redirección */}
                    <div className="botones">
                        <button 
                            className="btn btn-crear crear" 
                            onClick={() => navigate("/reservas-deportivas")}
                        >
                            Crear
                        </button>
                        <button 
                            className="btn btn-crear cancelar" 
                            onClick={() => navigate("/reservas-deportivas")}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Crear;