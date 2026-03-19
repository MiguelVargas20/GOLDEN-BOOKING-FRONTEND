import { Col, Container, Row, Button } from "react-bootstrap";
import '../styles/Home.css';
import { Outlet } from "react-router-dom";
import Carousel from 'react-bootstrap/Carousel';
import Card from 'react-bootstrap/Card';

//Imagenes para carrusel inicial
import CarruselImg1 from '../assets/aaaa.jpg'
import CarruselImg2 from '../assets/carrusel2.jpg'
import CarruselImg3 from '../assets/carrusel3.jpg'

//Imagenes para cards de instalaciones
import imgFutbol from '../assets/futbol.png';
import imgBasket from '../assets/basketball.png';
import imgTennis from '../assets/imgTennis.png';
import imgNatacion from '../assets/natacion.png';
import imgGolf from '../assets/golf.jpg';

//Imagen porque elegirnos
import imgSection from '../assets/elegirnos.png';


// Datos para las láminas del Carrusel (Hero Section)
const carruselData = [
    { img: CarruselImg1, id: 1 },
    { img: CarruselImg2, id: 2 },
    { img: CarruselImg3, id: 3 }
];  
{/*Constantes de imagenes para cards */}
const facilities = [
  { id: 1, title: 'Fútbol', desc: 'Canchas Profesionales', img: imgFutbol },
  { id: 2, title: 'Basketball', desc: 'Múltiples Canchas', img: imgBasket },
  { id: 3, title: 'Tennis', desc: 'Categorias por Nivel', img: imgTennis },
  { id: 4, title: 'Natación', desc: 'Olimpicas  Recreación', img: imgNatacion },
  { id: 5, title: 'Golf', desc: 'Campo Abierto', img: imgGolf },

];

{/*Constantes de imagenes para sección de porque elegirnos */}
const features = [
    { title: "Reservas Fáciles", desc: "Interfaz intuitiva con confirmación instantánea.", icon: "📅", color: "#fff4e6" },
    { title: "Instalaciones Premium", desc: "Espacios de primera clase en un solo lugar.", icon: "🏅", color: "#fff4e6" },
    { title: "Disponibilidad real-time", desc: "Validación inmediata 24/7 sin esperas.", icon: "⏰", color: "#fff4e6" }
];

//Funcion principal del componente Home, que incluye:
// 1.El carrusel inicial
// 2.La sección de reservas sugeridas y la sección de porque elegirnos.
// 3. Utiliza componentes de React Bootstrap para la estructura y estilo, 
// 4.Se apoya en constantes para manejar los datos de las instalaciones y características.
// 5. El Outlet al final permite renderizar rutas hijas dentro de esta página.

export default function Home() {
    return (
        <>
            {/* SECCIÓN 1: HERO / CARRUSEL
                Sirve como la primera impresión visual de la web.
                MEJORA: Se utiliza .map() para renderizar los Carousel.Item, reduciendo líneas de código.
            */}
            <section className="hero-wrapper">
                <Container>
                    <div className="hero-carousel-wrapper">
                        {/* fade: efecto de desvanecimiento entre imágenes | indicators: bolitas de navegación */}
                        <Carousel controls={false} indicators={true} fade>
                            {carruselData.map((item) => (
                                <Carousel.Item key={item.id}>
                                    <img className="d-block w-100 hero-img" src={item.img} alt="Slide" />
                                    {/* Caption personalizada y centrada mediante CSS (top: 50% + transform) */}
                                    <Carousel.Caption className="hero-caption-custom">
                                        <span className="premium-tag">EXPERIENCIA PREMIUM</span>
                                        <h1 className="hero-title">
                                            GOLDEN BOOKING <span className="orange-text">Club Valle Dorado</span>
                                        </h1>
                                        <p className="hero-subtitle">
                                            Descubre reservas de espacios deportivos, hotelería y más.
                                        </p>
                                        <div className="hero-buttons">
                                            <Button className="btn-orange">RESERVAR AHORA</Button>
                                            <Button className="btn-outline-glass">CONTÁCTANOS</Button>
                                        </div>
                                    </Carousel.Caption>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>
                </Container>
            </section>

            {/* SECCIÓN 2: GRID DE INSTALACIONES
                Muestra las opciones de reserva de forma rápida.
                MEJORA: Layout responsivo dinámico (1 col en móvil, 5 col en escritorio).
            */}
            <Container className="py-5">
                {/* Cabecera con título y enlace de navegación */}
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <span className="text-orange fw-bold small">Instalaciones</span>
                        <h2 className="bungee-regular">RESERVAS ESPACIOS</h2>
                    </div>
                    <a href="#all" className="text-orange fw-bold text-decoration-none small">
                        Ver todos los espacios →
                    </a>
                </div>

                {/* Renderizado dinámico de tarjetas desde la constante 'facilities' */}
                <Row xs={1} sm={2} lg={5} className="g-3">
                    {facilities.map((item) => (
                        <Col key={item.id}>
                            <Card className="h-100 facility-card border-0 shadow-sm">
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
            </Container>

            {/* SECCIÓN 3: VALOR AGREGADO (¿POR QUÉ ELEGIRNOS?)
                Sección de marketing para generar confianza al usuario.
                ESTRUCTURA: Texto a la izquierda, imagen con marco blanco a la derecha.
            */}
            <section className="why-choose-section py-5 my-5">
                <Container>
                    <Row className="align-items-center">
                        {/* Columna de Texto y Beneficios */}
                        <Col lg={6} className="pe-lg-5">
                            <h2 className="display-4 fw-bold mb-3">¿Por qué elegir <br /> Club Valle Dorado?</h2>
                            <p className="text-muted mb-5 lead-text">
                                Garantizamos menos tiempo reservando y más tiempo jugando.
                            </p>

                            {/* Mapeo de la constante 'features' para los items con iconos */}
                            {features.map((f, index) => (
                                <div key={index} className="feature-item d-flex align-items-center">
                                    {/* icon-box: Caja circular/cuadrada para el icono con fondo suave */}
                                    <div className="icon-box" style={{ backgroundColor: f.color }}>{f.icon}</div>
                                    <div className="ms-3">
                                        <h5 className="mb-1 fw-bold">{f.title}</h5>
                                        <p className="mb-0 text-muted small">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </Col>

                        {/* Columna de Imagen: Aplicamos clases de redondeo y sombra corregidas */}
                        <Col lg={6} className="text-center">
                            <img src={imgSection} alt="Luxury Club" className="img-fluid rounded-custom" />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* OUTLET: Punto de renderizado para rutas hijas.
                Permite que el Home funcione como un Layout si se desea.
            */}
            <Outlet />
        </>
    );
}