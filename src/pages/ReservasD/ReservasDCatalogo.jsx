import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CardReservaD from '../../components/CardReservas'
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
                <button className="btn-add-catalogo" onClick={() => navigate('/reservas-deportivas/gestionar')}>GESTIONAR RESERVAS</button>
                <h1>RESERVAS ESPACIOS DEPORTIVOS</h1>
                <button className="btn-add-catalogo" onClick={() => navigate('/reservas-deportivas/mis-reservas')}>MIS RESERVAS</button>
            </div>
            <div className="reservasD-cards">
                <CardReservaD
                    img={futbol}
                    titulo="CANCHA DE FÚTBOL"
                    add={() => add({ img: futbol, text: "FUTBOL" })}
                    reservaCard
                />
                <CardReservaD
                    img={basquet}
                    titulo="CANCHA DE BALONCESTO"
                    add={() => add({ img: basquet, text: "BALONCESTO" })}
                    reservaCard
                />

                <CardReservaD
                    img={piscina}
                    titulo="PISCINA"
                    add={() => add({ img: piscina, text: "PISCINA" })}
                    reservaCard
                />

                <CardReservaD
                    img={tenis}
                    titulo="CANCHA DE TENIS"
                    add={() => add({ img: tenis, text: "TENIS" })}
                    reservaCard
                />

                <CardReservaD
                    img={golf}
                    titulo="CAMPO DE GOLF"
                    add={() => add({ img: golf, text: "GOLF" })}
                    reservaCard
                />

                <CardReservaD
                    background="rgba()"
                    titulo="Añadir"
                    add={() => navigate('/reservas-deportivas/crear', {
                        state: {
                            espacio: "d"
                        }
                    })}
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