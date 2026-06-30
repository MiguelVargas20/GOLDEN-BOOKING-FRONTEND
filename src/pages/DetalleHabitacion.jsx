import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Button, Container, Row, Col, Card } from "react-bootstrap";
import { BiArrowBack, BiGroup, BiCalendar } from "react-icons/bi";
import { obtenerHabitacionPorId } from "../api/HabitacionApi";
import "../styles/DetalleHabitacion.css";

const PLACEHOLDER = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80";

export default function DetalleHabitacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [habitacion, setHabitacion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const data = await obtenerHabitacionPorId(id);
                setHabitacion(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        cargar();
    }, [id]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" style={{ color: "#c9a84c" }} />
        </div>
    );

    return (
        <Container className="main-container golden-booking-layout py-5">
            {/* El botón de volver ahora usa la clase btn-detail para unificar estilo */}
            <Button variant="link" className="btn-detail mb-4" onClick={() => navigate(-1)}>
                <BiArrowBack /> Volver al listado
            </Button>

            <Card className="hotel-card">
                <Row className="g-0">
                    <Col md={6} className="hotel-image-container">
                        <img 
                            src={habitacion.imagenUrl || PLACEHOLDER} 
                            className="hotel-image" 
                            alt="Habitación" 
                            onError={(e) => { e.target.src = PLACEHOLDER }} 
                        />
                    </Col>
                    
                    <Col md={6} className="hotel-info-block p-5">
                        <div className="hotel-header">
                            <h4>{habitacion.numeroHabitacion}</h4>
                        </div>
                        <h4 className="text-muted mb-4">{habitacion.datosTipoHabitacion?.nombreTipoHabitacion}</h4>
                        
                        <p className="room-description mb-4">{habitacion.descripcion || "Disfruta de una estancia inolvidable."}</p>

                        <div className="details-boxes">
                            <div className="details-box"><BiGroup /> Capacidad: {habitacion.datosTipoHabitacion?.capacidadMaxima} Pers.</div>
                            <div className="details-box"><BiCalendar /> WiFi: Incluido</div>
                        </div>

                        <div className="price-block mt-4">
                            <span className="base-price">${habitacion.precioNoche?.toLocaleString("es-CO")}</span>
                            <span className="price-label"> / noche</span>
                        </div>

                        <Button 
                            className="btn-reservar w-100 mt-4" 
                            onClick={() => alert("Reserva en proceso...")}
                        >
                            Reservar Ahora
                        </Button>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}