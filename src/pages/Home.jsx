import { Col, Container, Row } from "react-bootstrap";
import '../styles/Home.css';
import { Outlet } from "react-router-dom";

// Importar imágenes
import casa from "../assets/casa.png";
import hospedaje from "../assets/hospedaje.png";
import tenis from "../assets/tennis.png";
import clubValleDorado from "../../public/logo2.png";

export default function Home() {
  return (
    <>
      {/* 🔵 Carrusel antes de todo */}
      <div className="carousel-container">
        <div className="carousel-track">
          <img src={casa} alt="Casa" />
          <img src={hospedaje} alt="Hospedaje" />
          <img src={tenis} alt="Tenis" />
          <img src={casa} alt="Casa duplicada" />
          <img src={hospedaje} alt="Hospedaje duplicado" />
          <img src={tenis} alt="Tenis duplicado" />
        </div>
      </div>

      <Container className="principal">
        <Row className="principal-content">
          <Col>
            <h3 className="text-title">Club Valle Dorado</h3>
            <p>
              Somos un club comprometido con la experiencia de nuestros clientes,
              contamos con profesionales para cada experiencia; ofrecemos espacios
              recreativos, hospedaje en nuestras instalaciones, y lo más importante
              para toda la familia.
            </p>
          </Col>

          <Col className="right-side-icon">
            <img src={clubValleDorado} alt="Club Valle Dorado" className="logoValle" />
          </Col>
        </Row>
      </Container>

      <Outlet/>
    </>
  );
}
