import React from 'react'
import ReservaD from '../../components/ReservaD'
import futbol from "../../assets/EspaciosDeportivos/futbol.png"
import basquet from "../../assets/EspaciosDeportivos/basquet.png"
import piscina from "../../assets/EspaciosDeportivos/piscina.png"

function ReservasDSolicitadas() {
    return (
        <>
            <div className="titleRD">
                <div></div>
                <h2>Mis Reservas Deportivas</h2>
                <button className="btn btn-add">Add</button>
            </div>
            <div className="reservasD-cards">

                <ReservaD
                    img={futbol}
                    titulo="Cancha de Fútbol"
                    nPersonas="10 personas"
                    fecha="12/12/2025"
                    horaInicio="08:00 AM"
                    horaFin="10:00"
                    horaExt="AM"
                    categoria="Deporte"
                />

                <ReservaD
                    img={basquet}
                    titulo="Cancha de Baloncesto"
                    nPersonas="6 personas"
                    fecha="15/12/2025"
                    horaInicio="03:00 PM"
                    horaFin="05:00"
                    horaExt="PM"
                    categoria="Deporte Indoor"
                />

                <ReservaD
                    img={piscina}
                    titulo="Piscina"
                    nPersonas="4 personas"
                    fecha="20/12/2025"
                    horaInicio="11:00 AM"
                    horaFin="12:30"
                    horaExt="PM"
                    categoria="Acuático"
                />

            </div>
        </>
    )
}

export default ReservasDSolicitadas
