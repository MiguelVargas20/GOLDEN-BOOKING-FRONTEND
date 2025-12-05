import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from 'react-bootstrap/Container';
import { FaReply } from "react-icons/fa";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/Forgot.css'

import forgot from '../assets/forgot.png'
import logo from '../assets/LOGO.png'

function Forgot() {
  return (
    <Container fluid className="forgot-content">

      {/* HEADER ARRIBA */}
      <Row>
        <Col>
          <header className="forgot-header">
            <img src={logo} alt="logo" className="forgot-logo" />
          </header>
        </Col>
      </Row>

      {/* CONTENIDO PRINCIPAL */}
      <Row className="forgot-row">

        {/* IZQUIERDA */}
        <Col>
          <div className="forgot-left">

            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="forgot-title">
                  <h2>¿Olvidaste tu Contraseña?</h2>
                </Form.Label>

                <p className="forgot-text">A todos nos pasa, aqui te ayudamos</p>

                <Form.Control
                  type="email"
                  className="forgot-input"
                  placeholder="usuario.nombre@gmail.com"
                />
              </Form.Group>
            </Form>

            <button
              className="forgot-back-btn"
              onClick={() => window.location.href = "/login"}
            >
              Volver a Login <FaReply />
            </button>

            <Button className="forgot-btn-send" type="submit">
              ENVIAR
            </Button>

          </div>
        </Col>

        {/* DERECHA - IMAGEN */}
        <Col className="side-right-forgot">
          <img src={forgot} alt="Forgot" className="forgot-image" />
        </Col>

      </Row>
    </Container>
  );
}

export default Forgot;


