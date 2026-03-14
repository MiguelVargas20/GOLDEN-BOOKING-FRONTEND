import { Container, Row, Col, Form } from "react-bootstrap";
import '../styles/Contactos.css'
import mapa from '../assets/mapa.png'
import mapaimg from '../assets/mapa-img.png'

export default function Contactos() {
  return (
    <>
      <h1 className="bungee-regular">CONTÁCTANOS</h1>
      <Container className="contact-box">
        <Row>

          <Form.Control
            type="text"
            placeholder="Cuéntanos tu nombre"
            className="input-field nombre"
          />

          <Form.Control
            type="email"
            placeholder="Correo electrónico"
            className="input-field correo"
          />

          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Escribe tu mensaje"
            className="textarea-field mensaje"
          />

          {/* MAPA */}
          <Col className="map-section">
            <div className="map-iframe">
              <img src={mapaimg} alt="Mapa" />
            </div>
            <img src={mapa} alt="mapa" className="map-marker" />
          </Col>
        </Row>
      </Container>
    </>
  );
}