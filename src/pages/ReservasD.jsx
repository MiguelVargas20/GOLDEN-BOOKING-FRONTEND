import "../styles/ReservasD.css"
import CardReservaD from "../components/CardReservaD"
import futbol from "../assets/EspaciosDeportivos/futbol.png"
import golf from "../assets/EspaciosDeportivos/golf.png"
import tenis from "../assets/EspaciosDeportivos/tennis.png"
import basquet from "../assets/EspaciosDeportivos/basquet.png"
import piscina from "../assets/EspaciosDeportivos/piscina.png"

export default function ReservasD(){
    return(
        <div className="reservasD-container">
            <h2>Reservas Espacios Deportivos</h2>
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
        </div>
    )
}