import "../../styles/ReservasD/ReservasD.css"
import { Outlet } from "react-router-dom"

export default function ReservasD(){
    return(
        <div className="reservasD-container">
            <Outlet />
        </div>
    )
}