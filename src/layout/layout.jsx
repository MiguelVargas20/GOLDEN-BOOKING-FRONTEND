import NavDropdown from 'react-bootstrap/NavDropdown';
import { Outlet } from 'react-router-dom'
import logo from '../assets/LOGO.PNG'
import { useNavigate } from 'react-router-dom';
import './layout.css'

export default function Layout() {
    const navigate = useNavigate();

    return (
        <div className="contenedor">
            <div className="header">

                <div className='Header'>
                    <img src={logo} alt="logo" className='logo' />
                    <div className='admin'>
                        <h4><strong>Admin</strong></h4>
                        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="currentColor" className="img-bold" viewBox="0 0 18 18">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                        </svg>
                    </div>
                </div>

                <nav className="navbar">
                    <ul className="nav">
                        <li className="nav-item"><a className="nav-link text-dark" onClick={() => navigate("/home")}>INICIO</a></li>
                        <NavDropdown
                            title="SERVICIOS"
                            className='nav-dark'
                            menuVariant="dark">
                            <NavDropdown.Item onClick={() => navigate("/reservas-deportivas")}>ESPACIOS DEPORTIVOS</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => navigate("/reservas-hospedaje")}>HOSPEDAJE</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => navigate("/reservas-restaurante")}>RESTAURANTE </NavDropdown.Item>
                        </NavDropdown>
                        <li className="nav-item"><a className="nav-link text-dark" onClick={() => navigate("/contactos")}>CONTACTANOS</a></li>
                        <li className="nav-item"><a className="nav-link text-dark" onClick={() => navigate("/usuarios")}>USUARIOS</a></li>
                    </ul>
                </nav>

            </div>
            <div className="content">
                <Outlet></Outlet>
            </div>
            <div className="footer">

                <footer className="text-center text-dark fw-bold py-3">
                    © 2025 Golden Booking · Todos los derechos reservados
                </footer>


            </div>
        </div>
    )
}