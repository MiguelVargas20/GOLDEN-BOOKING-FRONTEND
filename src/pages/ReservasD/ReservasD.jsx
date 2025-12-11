import "../../styles/ReservasD.css"
import CardReservaD from "../../components/CardReservasD"
import { Outlet } from "react-router-dom"

export default function ReservasD(){
    return(
        <div className="reservasD-container">
            <Outlet />
        </div>
    )
}