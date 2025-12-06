import { Container, Row, Col, Form } from "react-bootstrap";
import '../styles/Contactos.css'
import mapa from '../assets/mapa.png'

export default function Contactos(){
    return(
        <>
        <h1 className="title-contactos">CONTÁCTANOS</h1>  
 <Container fluid className="contact-box">
      <Row>

        {/* FORMULARIO */}
        <Col md={6} className="form-section">
          <Form.Control
            type="text"
            placeholder="Cuéntanos tu nombre"
            className="input-field"
          />

          <Form.Control
            type="email"
            placeholder="Correo electrónico"
            className="input-field"
          />

          <Form.Control
            as="textarea"
            rows={5}
            placeholder="Escribe tu mensaje"
            className="textarea-field"
          />
        </Col>

        {/* MAPA */}
        <Col md={6} className="map-section">
          <iframe
            title="Mapa"
            className="map-iframe"
            src="">
          </iframe>
          <img src={mapa} alt="mapa"className="map-marker"/>
        </Col>
      </Row>
    </Container>
        </>
    );
}