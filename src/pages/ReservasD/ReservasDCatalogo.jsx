import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card } from 'react-bootstrap';

// Imagenes para cards de instalaciones
import imgFutbol from '../../assets/futbol.png';
import imgBasket from '../../assets/basketball.png';
import imgTennis from '../../assets/imgTennis.png';
import imgNatacion from '../../assets/natacion.png';
import imgGolf from '../../assets/golf.jpg';
import imgVoleybol from '../../assets/imgVoleybol.png';
import imgPingPong from '../../assets/imgPingPong.png'; 
import imgPatinaje from '../../assets/imgPatinaje.png';
import imgHockey from '../../assets/imgHockey.png';
import imgCiclismo from '../../assets/imgCiclismo.png';

import { BsCalendar4 } from "react-icons/bs";
import { BsArrowCounterclockwise } from "react-icons/bs";

// Función para verificar si el usuario es ADMIN
import { useAuth } from "../../context/AuthContext";

function ReservasDCatalogo() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    // Función para manejar el click en "Reservar" y navegar a la página de reserva
    const add = (img, text) => {
        navigate("/reservas-deportivas/reservar-espacio", {
            state: {
                ruta: img,
                text: text,
            },
        });
    };

    const facilities = [
        { id: 1, title: 'Fútbol', desc: 'Canchas Profesionales', img: imgFutbol },
        { id: 2, title: 'Basketball', desc: 'Múltiples Canchas', img: imgBasket },
        { id: 3, title: 'Tennis', desc: 'Categorias por Nivel', img: imgTennis },
        { id: 4, title: 'Natación', desc: 'Olimpicas Recreación', img: imgNatacion },
        { id: 5, title: 'Golf', desc: 'Campo Abierto', img: imgGolf },
        { id: 6, title: 'Voleybol', desc: 'Campo Abierto', img: imgVoleybol },
        { id: 7, title: 'Ping Pong', desc: 'Campo Abierto', img: imgPingPong },
        { id: 8, title: 'Patinaje', desc: 'Campo Abierto', img: imgPatinaje },
        { id: 9, title: 'Hockey', desc: 'Campo Abierto', img: imgHockey },
        { id: 10, title: 'Ciclismo', desc: 'Campo Abierto', img: imgCiclismo },
    ];

    return (
        <div className="reservas-container">
            {/* Contenedor Grid que alinea botones y título en la misma fila */}
            <div className="botones-reservas">
                
                {/* 1. LADO IZQUIERDO: Gestionar (Solo si es Admin) */}
                {isAdmin() ? (
                    <button
                        className="btn-reserva gestionar"
                        onClick={() => navigate("/reservas-deportivas/gestionar")}>
                        <BsCalendar4 /> GESTIONAR RESERVAS
                    </button>
                ) : (
                    <div /> /* Div vacío para que el título no se mueva de su sitio si no eres admin */
                )}

                {/* 2. CENTRO: Título alineado */}
                <h1 className="titulo-reservas">
                    RESERVAS DE <span>ESPACIOS</span>
                </h1>

                {/* 3. LADO DERECHO: Mis Reservas */}
                <button
                    className="btn-reserva mis"
                    onClick={() => navigate("/reservas-deportivas/mis-reservas")}>
                    <BsArrowCounterclockwise /> MIS RESERVAS
                </button>
                
            </div>

            {/* Cuadrícula de instalaciones */}
            <Row xs={1} sm={2} lg={5} className="g-3">
                {facilities.map((item) => (
                    <Col key={item.id}>
                        <Card 
                            className="h-100 facility-card border-0 shadow-sm"
                            onClick={() => add(item.img, item.title)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="img-container">
                                <Card.Img variant="top" src={item.img} className="facility-img" />
                            </div>
                            <Card.Body className="px-3 py-3">
                                <Card.Title className="h6 fw-bold mb-1">{item.title}</Card.Title>
                                <Card.Text className="text-muted small">{item.desc}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default ReservasDCatalogo;