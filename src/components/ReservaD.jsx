import React from 'react'
import { useNavigate } from 'react-router-dom'

function ReservaD(props) {
    const navigate = useNavigate();

  return (
    <div className='comp-reservaD'>
        <div 
            className="card-reservaD"
            style={{
                backgroundImage: `url(${props.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
        </div>
        <div className="descripcion">
            <h3>{props.titulo}</h3>
            <p>{props.nPersonas}</p>
            <p>{props.fecha}</p>
            <p>{props.horaInicio} - {props.horaFin} {props.horaExt}</p>
            <p>{props.categoria}</p>
        </div>
        <div className="buttons">
            <button className="btn edit" onClick={() => navigate("/reservas-deportivas/editar")}>Edit</button>
            <button className="btn delete">Delete</button>
        </div>
    </div>
  )
}

export default ReservaD