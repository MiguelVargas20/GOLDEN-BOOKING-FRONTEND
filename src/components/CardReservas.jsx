import React from 'react';
import { FaPlus } from 'react-icons/fa';

/**
 * Componente CardReservaD
 * Renderiza una tarjeta dinámica que puede actuar como visualizador de reserva o como botón para añadir una nueva.
 * * @param {Object} props - Propiedades del componente
 * @param {boolean} props.reservaCard - Define el estado/diseño de la tarjeta (true: muestra reserva, false: botón añadir)
 * @param {string} props.img - URL de la imagen de fondo (si reservaCard es true)
 * @param {string} props.titulo - Título de la reserva (si reservaCard es true)
 * @param {function} props.add - Función manejadora del evento click
 */
function CardReservaD(props) {
    return (
        <div
            // Asignación dinámica de clases según el tipo de tarjeta
            className={`card-reservaD ${props.reservaCard ? '' : 'card-add'}`}
            
            // Estilos en línea condicionales para el fondo y la disposición de elementos
            style={
                props.reservaCard
                    ? {
                        backgroundImage: `url(${props.img})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        cursor: "pointer",
                    }
                    : {
                        background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3))",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }
            }
            // Evento de click heredado de las props
            onClick={props.add}
        >
            {/* Renderizado condicional del contenido:
                Si es una tarjeta de reserva activa muestra el título, 
                de lo contrario, muestra el icono de suma para agregar.
            */}
            {props.reservaCard ? (
                <h3>{props.titulo}</h3>
            ) : (
                <FaPlus className="add-icon" size={40} color="#fff" />
            )}
        </div>
    );
}

export default CardReservaD;