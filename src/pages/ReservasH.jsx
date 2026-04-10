import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoCalendarOutline, IoHeartOutline, IoStar } from "react-icons/io5";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";
import { BiCalendar } from "react-icons/bi";
import Hotel from '../assets/Hotel.png';
import imagen_habitacion from '../assets/imagen_habitación.png';

import '../styles/reservasH.css';

function Navbar() {
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);

    const navigate = useNavigate();

    const hoteles = [
        {
            id: 1,
            img: Hotel,
            nombre: "Habitación Doble · 2 camas · Vista al jardín",
            ubicacion: "Colombia - Cartagena",
            precio: 589.950,
            rating: 4.9
        },
        {
            id: 2,
            img: imagen_habitacion,
            nombre: "The Hearth Estate",
            precio: 450.000,
            rating: 4.8
        }

    ];

    return (
        <div className="container-fluid main-container">

            <Row>
                {/* 🔹 LISTA HOTELES */}
                <Col>

                    {hoteles.map((hotel) => (
                        <div key={hotel.id} className="hotel-card mb-4">

                            <img src={hotel.img} alt="hotel" className="hotel-image" />

                            <div className="hotel-info">

                                <div className="hotel-header">
                                    <h4>{hotel.nombre}</h4>
                                    <div className="rating">
                                        <IoStar /> {hotel.rating}
                                    </div>
                                </div>

                                <p className="location">📍 {hotel.ubicacion}</p>

                                <div className="amenities">
                                    <span>Free WiFi</span>
                                    <span>Breakfast included</span>
                                </div>

                                {/* FORM */}
                                <Dropdown className="mb-3 w-100">
                                    <Dropdown.Toggle className="dropdown-guests w-100">
                                        {adults} Adultos · {children} Niños · {rooms} Habitaciones
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="dropdown-menu-guests">
                                        <Counter label="Adultos" value={adults} setValue={setAdults} />
                                        <Counter label="Niños" value={children} setValue={setChildren} />
                                        <Counter label="Habitaciones" value={rooms} setValue={setRooms} />
                                    </Dropdown.Menu>
                                </Dropdown>
                                <h4 className="title-dates">Selecciona tus fechas</h4>

                                <div className="dates-container">
                                    <div className="date-box">
                                        <label>Check-in</label>
                                        <div className="input-wrapper">
                                            <BiCalendar className="icon" />
                                            <input type="date" />
                                        </div>
                                    </div>

                                    <div className="date-box">
                                        <label>Check-out</label>
                                        <div className="input-wrapper">
                                            <BiCalendar className="icon" />
                                            <input type="date" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hotel-actions">
                                <IoHeartOutline className="fav" />
                                <h3>${hotel.precio}</h3>
                                <span>/ night</span>

                                <button
                                    className="btn-detail"
                                    onClick={() => navigate("/detalle/" + hotel.id)}y >
                                    Ver detalle
                                </button>
                            </div>
                        </div>
                    ))}
                </Col>
            </Row>
        </div>
    );
}

function Counter({ label, value, setValue }) {
    return (
        <div className="counter-row">
            <span>{label}</span>
            <div>
                <button onClick={() => value > 0 && setValue(value - 1)}>-</button>
                <span>{value}</span>
                <button onClick={() => setValue(value + 1)}>+</button>
            </div>
        </div>
    );
}

export default Navbar;
