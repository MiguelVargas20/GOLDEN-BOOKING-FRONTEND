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
                <h2>MIS RESERVAS DEPORTIVAS</h2>
                <div></div>
            </div>
            <div className="reservasD-cards">

                <ReservaD
                    img={futbol}
                    titulo="CANCHA DE FUTBOL"
                    nPersonas="10 personas"
                    fecha="12/12/2025"
                    horaInicio="08:00 AM"
                    horaFin="10:00"
                    horaExt="AM"
                    categoria="Deporte"
                />

                <ReservaD
                    img={basquet}
                    titulo="CANCHA BALONCESTO"
                    nPersonas="6 personas"
                    fecha="15/12/2025"
                    horaInicio="03:00 PM"
                    horaFin="05:00"
                    horaExt="PM"
                    categoria="Deporte Indoor"
                />

                <ReservaD
                    img={piscina}
                    titulo="PISCINA OLÍMPICA"
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
