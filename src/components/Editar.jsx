import { FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Componente Editar
 * Renderiza el formulario de edición para un espacio deportivo existente,
 * permitiendo modificar su nombre, capacidad y categoría.
 */
function Editar() {
    const navigate = useNavigate();

    return (
        <div className="editar-containerRD">
            {/* Título principal de la sección */}
            <h2 className="titulo">EDITAR ESPACIO DEPORTIVO</h2>

            {/* Contenedor tipo tarjeta para el formulario */}
            <div className="card-editar">
                <div className="card-header">
                    EDITAR ESPACIO DEPORTIVO
                </div>

                <div className="card-body">
                    {/* Área dedicada a la carga o reemplazo de la imagen del espacio */}
                    <div className="upload-box">
                        <FaUpload className="upload-icon" />
                    </div>

                    {/* Formulario de edición de datos */}
                    <div className="formulario">
                        {/* Campo de texto para modificar el nombre */}
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="input"
                        />

                        {/* Selector para modificar la capacidad máxima (Genera dinámicamente opciones del 1 al 15) */}
                        <select className="input">
                            <option>No. Personas</option>
                            {Array.from({ length: 15 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>

                        {/* Selector para modificar la disciplina deportiva asociada */}
                        <select className="input">
                            <option>Categoría</option>
                            <option>Fútbol</option>
                            <option>Baloncesto</option>
                            <option>Tenis</option>
                            <option>Piscina</option>
                        </select>

                        {/* Botones de control con redirección a la vista general */}
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