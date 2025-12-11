import NavDropdown from 'react-bootstrap/NavDropdown';
import { IoCalendarOutline } from "react-icons/io5";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/LOGO.png'
import '../styles/Booking.css'
import Tenis from '../assets/Tenis.png'


function Navbar() {
    return (
        <>
            <div className='Header'>
                <img src={logo} alt="logo" className='booking-img' />
                <div className='admin'>
                    <h3>Admin</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                </div>
            </div>

            <nav className="navbar">
                <ul className="nav">
                    <li className="nav-item"><a className="nav-link text-dark" href="#">INICIO</a></li>
                    <NavDropdown
                        title="SERVICIOS"
                        className='nav-dark'
                        menuVariant="dark">
                        <NavDropdown.Item href="#action/3.1">ESPACIOS DEPORTIVOS</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">HOSPEDAJE</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">RESTAURANTE </NavDropdown.Item>
                    </NavDropdown>
                    <li classN ame="nav-item"><a className="nav-link text-dark" href="#">CONTACTANOS</a></li>
                    <li className="nav-item"><a className="nav-link text-dark" href="#">USUARIOS</a></li>
                </ul>
            </nav>
            <h1 className='booking-title'>RESERVA TENNIS</h1>
            <Row>
                <Col className='image-tenis'>
                    <img src={Tenis} alt="Tenis" className='tenis-img' />
                </Col>
                <Col className='booking-form'>
                    <Form.Select aria-label="Default select example">
                        <option>No.Personas</option>
                        <option value="1">1 persona</option>
                        <option value="2">2 persona</option>
                        <option value="3">3 persona</option>
                        <option value="4">3 persona</option>
                    </Form.Select>
                    <div class="date-picker">
                        <input
                            type="date"
                            id="start"
                            min="2025-01-01"
                            max="2025-12-31"
                            placeholder="Seleccionar fecha"
                            />
                            <IoCalendarOutline className="calendar-icon"  />
                    </div>
                    <Form.Select aria-label="Selecciona un horario">
                        <option value="">Selecciona un horario</option>
                        <option value="8-9">08:00 - 09:00</option>
                        <option value="9-10">09:00 - 10:00</option>
                        <option value="10-11">10:00 - 11:00</option>
                        <option value="15-16">15:00 - 16:00</option>
                        <option value="16-17">16:00 - 17:00</option>
                    </Form.Select>

                    <Form.Select aria-label="Default select example">
                        <option>Seleccionar Categoria</option>
                        <option value="1">Individual</option>
                        <option value="2">Dobles</option>
                    </Form.Select>

                    <Col className='buttons-booking'>
                        <button className='button-buscar'>BUSCAR</button>
                        <button className='button-buscar'>CANCELAR</button>
                    </Col>

                </Col>
            </Row>

            <footer className="text-center"
                style={{
                    background: "linear-gradient(to right, #ffd700, #f28500)"
                }}>
                © 2025 Golden Booking · Todos los derechos reservados
            </footer>


        </>
    );
}
export default Navbar