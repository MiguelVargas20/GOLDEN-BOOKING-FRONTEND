import React from 'react'
import { useNavigate } from 'react-router-dom'
import CardReservaD from '../../components/CardReservasD'
import golf from "../../assets/EspaciosDeportivos/golf.png"
import tenis from "../../assets/EspaciosDeportivos/tennis.png"
import futbol from "../../assets/EspaciosDeportivos/futbol.png"
import basquet from "../../assets/EspaciosDeportivos/basquet.png"
import piscina from "../../assets/EspaciosDeportivos/piscina.png"

function ReservasDCatalogo() {
    const navigate = useNavigate();
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
                />
                <CardReservaD
                    img={basquet}
                    titulo="Cancha de Baloncesto"
                />
                <CardReservaD
                    img={piscina}
                    titulo="Piscina"
                />
                <CardReservaD
                    img={tenis}
                    titulo="Cancha de Tenis"
                />
                <CardReservaD
                    img={golf}
                    titulo="Campo de Golf"
                />
            </div>
        </>
    )
}

export default ReservasDCatalogo