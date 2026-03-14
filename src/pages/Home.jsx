import { Col, Container, Row, Button } from "react-bootstrap";
import '../styles/Home.css';
import { Outlet } from "react-router-dom";
import Carousel from 'react-bootstrap/Carousel';

import Card from 'react-bootstrap/Card';

// Asegúrate de importar la imagen que quieres de fondo para el Hero
import CarruselImg1 from '../assets/aaaa.jpg'
import CarruselImg2 from '../assets/carrusel2.jpg'
import CarruselImg3 from '../assets/carrusel3.jpg'

import imgFutbol from '../assets/futbol.png';
import imgBasket from '../assets/basketball.png';
import imgTennis from '../assets/imgTennis.png';
import imgNatacion from '../assets/natacion.png';


{/*Constantes de imagenes para cards */}
const facilities = [
  { id: 1, title: 'Soccer', desc: 'Professional turf fields', img: imgFutbol },
  { id: 2, title: 'Basketball', desc: 'Indoor climate-controlled', img: imgBasket },
  { id: 3, title: 'Tennis', desc: 'Clay & Hard courts', img: imgTennis },
  { id: 4, title: 'Swimming', desc: 'Olympic & Leisure pools', img: imgNatacion },

];
export default function Home() {
  return (
    <>
      <div className="hero-wrapper">
        <Container>
          <div className="hero-carousel-wrapper">
      <Carousel controls={false} indicators={true} fade>
        <Carousel.Item>
          {/* Imagen de fondo */}
          <img
            className="d-block w-100 hero-img"
            src={CarruselImg1}
            alt="First slide"
          />
          
          {/* Contenido encima de la imagen */}
          <Carousel.Caption className="hero-caption-custom">
            <span className="premium-tag">EXPERIENCIA PREMIUM</span>
            <h1 className="hero-title">
              GOLDEN BOOKING <span className="orange-text">Club Valle Dorado</span>
            </h1>
            <p className="hero-subtitle">
            Descubre reservas de espacios deportivos, reservas hoteleres y muchos de nuestros otros servicios
            </p>
            <div className="hero-buttons">
              <Button className="btn-orange">Reservar Ahora</Button>
              <Button className="btn-outline-glass">Contactanos</Button>
            </div>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          {/* Imagen de fondo */}
          <img
            className="d-block w-100 hero-img"
            src={CarruselImg2}
            alt="Second slide"
          />
          
          {/* Contenido encima de la imagen */}
          <Carousel.Caption className="hero-caption-custom">
            <span className="premium-tag">EXPERIENCIA PREMIUM</span>
            <h1 className="hero-title">
              GOLDEN BOOKING <span className="orange-text">Club Valle Dorado</span>
            </h1>
            <p className="hero-subtitle">
            Descubre reservas de espacios deportivos, reservas hoteleres y muchos de nuestros otros servicios
            </p>
            <div className="hero-buttons">
              <Button className="btn-orange">Reservar Ahora</Button>
              <Button className="btn-outline-glass">Contactanos</Button>
            </div>
          </Carousel.Caption>
        </Carousel.Item>


        <Carousel.Item>
          {/* Imagen de fondo */}
          <img
            className="d-block w-100 hero-img"
            src={CarruselImg3}
            alt="Third slide"
          />
          
          {/* Contenido encima de la imagen */}
          <Carousel.Caption className="hero-caption-custom">
            <span className="premium-tag">EXPERIENCIA PREMIUM</span>
            <h1 className="hero-title">
              GOLDEN BOOKING <span className="orange-text">Club Valle Dorado</span>
            </h1>
            <p className="hero-subtitle">
            Descubre reservas de espacios deportivos, reservas hoteleres y muchos de nuestros otros servicios
            </p>
            <div className="hero-buttons">
              <Button className="btn-orange">Reservar Ahora</Button>
              <Button className="btn-outline-glass">Contactanos</Button>
            </div>
          </Carousel.Caption>
        </Carousel.Item>
        
      </Carousel>
    </div>
        </Container>
    </div>

    {/* Reservas Sugerencias*/}
<Container className="py-5">
      {/* Header de la sección */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span className="text-orange fw-bold small text-uppercase">Instalaciones</span>
          <h2 className="fw-bold section-title">Reservas de Espacios</h2>
        </div>
        <a href="#all" className="text-orange fw-bold text-decoration-none small">
          Ver todos los espacios →
        </a>
      </div>

      {/* Grid de Cards */}
      <Row xs={1} sm={2} lg={5} className="g-3">
        {facilities.map((item) => (
          <Col key={item.id}>
            <Card className="h-100 facility-card border-0 shadow-sm">
              <div className="img-container">
                <Card.Img variant="top" src={item.img} className="facility-img" />
              </div>
              <Card.Body className="px-3 py-3">
                <Card.Title className="h6 fw-bold mb-1">{item.title}</Card.Title>
                <Card.Text className="text-muted small">
                  {item.desc}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>

      <Outlet/>
    </>
    
  );
}
