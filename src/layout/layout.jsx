import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/LOGO.PNG";
import "./layout.css";

export default function Layout() {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar si se hace clic afuera
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="contenedor">

            <div className="header">
                <div className="Header">
                    <img src={logo} alt="logo" className="logo" />

                    <div className="admin">
                        <h4><strong>Admin</strong></h4>

                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                            className="img-bold" viewBox="0 0 16 16">
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        </svg>

                    </div>
                </div>

                {/* NAVBAR */}
                <nav className="navbar">
                    <ul className="nav">
                        <li className="nav-item">
                            <a className="nav-link text-dark" onClick={() => navigate("/home")}>INICIO</a>
                        </li>

                        {/* --------------------------- */}
                        {/*      DROPDOWN CUSTOM        */}
                        {/* --------------------------- */}
                        <li className="nav-item dropdown" ref={dropdownRef}>
                            <button
                                className="nav-link text-dark dropdown-toggle-custom"
                                onClick={() => setOpen(!open)}
                            >
                                SERVICIOS
                            </button>

                            {open && (
                                <div className="dropdown-menu-custom">
                                    <div className="dropdown-item-custom"
                                        onClick={() => { setOpen(false); navigate("/reservas-deportivas"); }}>
                                        ESPACIOS DEPORTIVOS
                                    </div>

                                    <div className="dropdown-item-custom"
                                        onClick={() => { setOpen(false); navigate("/reservas-hospedaje"); }}>
                                        HOSPEDAJE
                                    </div>
                                </div>
                            )}
                        </li>

                        <li className="nav-item">9
                            <a className="nav-link text-dark" onClick={() => navigate("/contactos")}>CONTACTANOS</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link text-dark" onClick={() => navigate("/usuarios")}>USUARIOS</a>
                        </li>
                    </ul>
                </nav>

            </div>

            <div className="content">
                <Outlet />
            </div>

            <div className="footer">
                <footer className="text-center text-dark fw-bold py-3">
                    © 2025 Golden Booking · Todos los derechos reservados
                </footer>
            </div>

        </div>
    );
}
