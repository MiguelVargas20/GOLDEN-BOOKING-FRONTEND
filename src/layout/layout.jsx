import { Outlet } from "react-router-dom";
import Footer from '../components/Footer'; 
import Navbar from "../components/Navbar";
import "./layout.css";

/**
 * Componente Layout
 * Actúa como la plantilla maestra (Master Page) de la aplicación.
 * Define la estructura global envolviendo la barra de navegación superior,
 * el contenedor dinámico de rutas hijas (<Outlet />) y el pie de página.
 */
export default function Layout() {
    return (
        <div className="contenedor">
            <div className="Navbar">
                <Navbar />
            </div>

            <div className="content">
                <Outlet />
            </div>

            <div className="footer">
                <Footer />
            </div>
        </div>
    );
}