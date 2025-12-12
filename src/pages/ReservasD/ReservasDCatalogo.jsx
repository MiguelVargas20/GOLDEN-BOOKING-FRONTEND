import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CardReservaD from '../../components/CardReservasD'
import golf from "../../assets/EspaciosDeportivos/golf.png"
import tenis from "../../assets/EspaciosDeportivos/tennis.png"
import futbol from "../../assets/EspaciosDeportivos/futbol.png"
import basquet from "../../assets/EspaciosDeportivos/basquet.png"
import piscina from "../../assets/EspaciosDeportivos/piscina.png"

function ReservasDCatalogo() {
    const [ ruta, setRuta ] = useState("");
    const [ text, setText ] = useState("");
    const [ reservar, setReservar ] = useState(false);
    const navigate = useNavigate();

    const add = ({ img, text }) => {
        setRuta(img);
        setText(text)
        setReservar(true);
    };

    const calcel = () => {
        setRuta("");
        setText("");
        setReservar(false);
    }

    return (
        <>
            <div className="titleRD">
                <div></div>
                <h2>Reservas Espacios Deportivos</h2>
                <button className="btn btn-add" onClick={() => navigate('/reservas-deportivas/mis-reservas')}>Mis Reservas</button>
            </div>
            <div className="reservasD-cards">
                <CardReservaD
                    img={futbol}
                    titulo="Cancha de Fútbol"
                    add={() => add({ img: futbol, text: "Futbol" })}
                />
                <CardReservaD
                    img={basquet}
                    titulo="Cancha de Baloncesto"
                    add={() => add({ img: basquet, text: "Baloncesto" })}
                />

                <CardReservaD
                    img={piscina}
                    titulo="Piscina"
                    add={() => add({ img: piscina, text: "Piscina" })}
                />

                <CardReservaD
                    img={tenis}
                    titulo="Cancha de Tenis"
                    add={() => add({ img: tenis, text: "Tenis" })}
                />

                <CardReservaD
                    img={golf}
                    titulo="Campo de Golf"
                    add={() => add({ img: golf, text: "Golf" })}
                />

            </div>
            {
                (reservar) ?
                    navigate("/reservas-deportivas/reservar-espacio", {
                        state: {
                            ruta,
                            text
                        }
                    })
                    : ""
            }
        </>
    )
}

export default ReservasDCatalogo