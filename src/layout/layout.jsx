import { useState, useRef, useEffect } from "react";
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
    // Estado y referencia para controlar la apertura/cierre de un menú desplegable
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    /**
     * Efecto secundario para escuchar clics globales en el documento.
     * Si el usuario hace clic fuera del elemento referenciado (dropdownRef), este se cierra automáticamente.
     */
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        
        // Registrar el evento al montar el componente
        document.addEventListener("mousedown", handleClickOutside);
        
        // Limpieza (Cleanup): Remueve el listener al desmontar el componente para evitar fugas de memoria
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="contenedor">
            {/* Sección superior: Barra de navegación global */}
            <div className="Navbar">
                <Navbar />
            </div>

            {/* Sección central: Renderiza dinámicamente la vista según la ruta actual */}
            <div className="content">
                <Outlet />
            </div>

            {/* Sección inferior: Pie de página institucional */}
            <div className="footer">
                <Footer />
            </div>
        </div>
    );
}