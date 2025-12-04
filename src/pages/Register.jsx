import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/Register.css';
import click from '../assets/click.png';
import logo from '../assets/LOGO.png'


function Register() {
  const [ver, setVer] = useState(false);

  return (
    <Row className="login-content">
      <Col> 
        <Form className="login-form px-3">
          <Row>
            <header className="site-header">
              <img src={logo} alt="logo" className="site-logo" />
            </header>
          </Row>

          <Row className="justify-content-center align-items-center form-container mx-3">
            <div className="page-heading">
              <h2>Crea tu cuenta</h2>
              <p>Registrate para acceder a tu reserva</p>
            </div>

            <registro-content className="pl-3">

              <Form.Group className="mb-2" controlId="formBasicName">
                <Form.Control className="inp" type="text" placeholder="Nombre Completo" />
              </Form.Group>

              <Form.Group className="mb-2" controlId="formBasicEmail">
                <Form.Control className="inp" type="email" placeholder="usuario.nombre@gmail.com" />
              </Form.Group>
              <Form.Group className="mb-2" controlId="formBasicPassword">
                <Form.Control
                  className="inp"
                  type={ver ? "text" : "password"}
                  placeholder="Contraseña"
                />
              </Form.Group>
              <Form.Group className="mb-2" controlId="formBasicConfirmPassword">
                <Form.Control
                  className="inp"
                  type={ver ? "text" : "password"}
                  placeholder="Confirmar Contraseña"
                />
              </Form.Group>
              <Form.Group className="mb-2" controlId="formBasicCheckbox">
                <Form.Check
                  type="checkbox"
                  label="Mostrar Contraseñas"
                  checked={ver}
                  onChange={() => setVer(!ver)}
                />
              </Form.Group>
            </registro-content>
            <Button className="btn-gold" type="submit">
          REGISTRARME
        </Button>

          </Row>
        </Form>
      </Col>

      <Col className="side-right">
        <img src={click} alt="click" className="logo_click" />
      </Col>
    </Row>
  );
}

export default Register;
