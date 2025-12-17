import { useLocation } from "react-router-dom";
import { Form } from "react-bootstrap";
import '../../styles/ReservasD/ReservarEspacio.css'
import React from 'react'
import { useNavigate } from "react-router-dom";

function ReservarEspacio(props) {
    const { state } = useLocation();
    const { ruta, text } = state || {};
    const navigate = useNavigate();

    return (
        <div className='reserva-espacio-container'>
            <h2>RESERVA {text}</h2>
            <div className="reservar-espacio-form">
                <div className="img">
                    <img src={ruta} alt={text} className="img"/>
                </div>
                <Form.Control
                    type="number"
                    placeholder="Numero de personas"
                    className="input-field nPersonas"
                />

                <Form.Control
                    type="datetime"
                    placeholder="Fecha"
                    className="input-field fecha"
                />

                <Form.Control
                    type="datetime"
                    placeholder="Horario"
                    className="input-field horario"
                />

                <Form.Control
                    type="text"
                    placeholder="Categoria"
                    className="input-field categoria"
                />

                <div className="buttons">
                    <button className="btn-reservar-espacio" onClick={() => navigate("/reservas-deportivas")}>RESERVAR</button>
                    <button className="btn-cancelar-espacio" onClick={() => navigate("/reservas-deportivas")}>CANCELAR</button>
                </div>

            </div>
        </div>
    )
}

export default ReservarEspacio