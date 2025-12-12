import React from 'react'

function CardReservaD(props) {
    return (
        <div 
            className="card-reservaD"
            style={{
                backgroundImage: `url(${props.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                cursor: "pointer",
            }}
            onClick={props.add}
        >
            <h3>{props.titulo}</h3>
        </div>
    )
}
export default CardReservaD;
