import { useState } from "react";
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoCalendarOutline } from "react-icons/io5";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from "react-bootstrap/Dropdown";
import LOGO from '../assets/LOGO.png';
import Hotel from '../assets/Hotel.png';
import '../styles/reservasH.css';

function Navbar() {
    const [adults, setAdults] = useState(0);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(0);

    return (
        <>
            <div className='Header'>
                <img src={LOGO} alt="LOGO" className='Hospedaje' />

                <div className='admin'>
                    <h3>Admin</h3>
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="50" height="50" fill="currentColor"
                        className="bi bi-person" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                </div>
            </div>

            <nav className="navbar">
                <ul className="nav">
                    <li className="nav-item"><a className="nav-link text-dark" href="#">INICIO</a></li>

                    <NavDropdown title="SERVICIOS" menuVariant="dark">
                        <NavDropdown.Item href="#action/3.1">ESPACIOS DEPORTIVOS</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">HOSPEDAJE</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">RESTAURANTE</NavDropdown.Item>
                    </NavDropdown>

                    <li className="nav-item"><a className="nav-link text-dark" href="#">CONTACTANOS</a></li>
                    <li className="nav-item"><a className="nav-link text-dark" href="#">USUARIOS</a></li>
                </ul>
            </nav>

            <h1 className='booking-title'>RESERVA HOSPEDAJE</h1>

            <Row>
                <Col className='image-tenis'>
                    <img src={Hotel} alt="Hotel" className='tenis-img' />
                </Col>

                <Col className='booking-form'>

                    {/* --- GUEST DROPDOWN --- */}
                    <Dropdown className="mb-3 w-100">
                        <Dropdown.Toggle
                            variant="light"
                            className="dropdown-guests w-100"
                        >
                            {adults} Adultos · {children} Niños · {rooms} Habitaciones
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropdown-menu-guests">
                            <Counter label="Adultos" value={adults} setValue={setAdults} min={1} />
                            <Counter label="Niños" value={children} setValue={setChildren} min={0} />
                            <Counter label="Habitaciones" value={rooms} setValue={setRooms} min={1} />
                        </Dropdown.Menu>
                    </Dropdown>
                    <div className="date-group">
                        <label>Entrada</label>
                        <div className="date-picker mb-3">
                            <input
                                type="date"
                                id="start"
                                min="2025-01-01"
                                max="2025-12-31"
                                placeholder="Seleccionar fecha"
                            />
                            <IoCalendarOutline className="calendar-icon" />
                        </div>
                    </div>
                    <div className="date-group">
                        <label>Salida</label>
                        <div className="date-picker mb-3">
                            <input
                                type="date"
                                id="start"
                                min="2025-01-01"
                                max="2025-12-31"
                                placeholder="Seleccionar fecha"
                            />
                            <IoCalendarOutline className="calendar-icon" />
                        </div>
                    </div>




                        <Col className='buttons-booking'>
                            <button className='button-buscar'>BUSCAR</button>
                            <button className='button-buscar'>CANCELAR</button>
                        </Col>
                </Col>
            </Row>

            <footer
                className="text-center"
                style={{ background: "linear-gradient(to right, #ffd700, #f28500)" }}
            >
                © 2025 Golden Booking · Todos los derechos reservados
            </footer>
        </>
    );
}

function Counter({ label, value, setValue, min = 0 }) {
    return (
        <div className="counter-row">
            <span>{label}</span>

            <div className="counter-buttons">
                <button
                    className="counter-btn"
                    onClick={() => value > min && setValue(value - 1)}
                >
                    -
                </button>

                <span className="counter-value">{value}</span>

                <button
                    className="counter-btn"
                    onClick={() => setValue(value + 1)}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default Navbar;