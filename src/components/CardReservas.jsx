import React from 'react'
import { FaPlus } from 'react-icons/fa'

function CardReservaD(props) {
    return (
        <div
            className={`card-reservaD ${props.reservaCard ? '' : 'card-add'}`}
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
            onClick={props.add}
        >
            {
                props.reservaCard
                    ? <h3>{props.titulo}</h3>
                    : <FaPlus className="add-icon" size={40} color="#fff" />
            }
        </div>
    )
}

export default CardReservaD;
