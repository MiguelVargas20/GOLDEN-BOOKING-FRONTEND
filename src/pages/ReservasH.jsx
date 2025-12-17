import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoCalendarOutline } from "react-icons/io5";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from "react-bootstrap/Dropdown";
import Hotel from '../assets/Hotel.png';
import '../styles/reservasH.css';

function Navbar() {
    const [adults, setAdults] = useState(0);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(0);

    return (
        <>
            <h1 className='booking-title'>RESERVA HOSPEDAJE</h1>

            <Row>
                <Col className='image-tenis'>
                    <img src={Hotel} alt="Hotel" className='hotel-img' />
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
                                max="2030-12-31"
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
                            <button
                                className="btn-aceptar-booking"
                                onClick={() => navigate("/")}>
                                BUSCAR
                            </button>
                            <button
                                className="btn-cancelar-booking"
                                onClick={() => navigate("/")}>
                                CANCELAR
                            </button>
                    </Col>
                </Col>
            </Row>
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