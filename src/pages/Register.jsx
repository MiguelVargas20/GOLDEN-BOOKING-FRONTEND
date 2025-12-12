import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/Register.css';
import '../styles/Login.css'
import click from '../assets/click.png';
import logo from '../assets/LOGO.png'
import { useNavigate } from "react-router-dom";

function Register() {
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);
  const navigate = useNavigate();

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
              <h1>Crea tu cuenta</h1>
              <p>Registrate para acceder a tu reserva</p>
            </div>

            <registro-content className="form-register">

              <Form.Group className="mb-2" controlId="formBasicName">
                <Form.Control className="inp" type="text" placeholder="Nombre Completo" />
              </Form.Group>

              <Form.Group className="mb-2" controlId="formBasicEmail">
                <Form.Control className="inp" type="email" placeholder="usuario.nombre@gmail.com" />
              </Form.Group>
              {/* CONTRASEÑA */}
              <div className="input-wrapper">
                <Form.Control
                  className="inp"
                  type={verPass ? "text" : "password"}
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  className="btn-eye"
                  onClick={() => setVerPass(!verPass)}
                >
                  {verPass ? "🙈" : "👁️"}
                </button>
              </div>

              {/* CONFIRMAR CONTRASEÑA */}
              <div className="input-wrapper">
                <Form.Control
                  className="inp"
                  type={verConfirm ? "text" : "password"}
                  placeholder="Confirmar Contraseña"
                />
                <button
                  type="button"
                  className="btn-eye"
                  onClick={() => setVerConfirm(!verConfirm)}
                >
                  {verConfirm ? "🙈" : "👁️"}
                </button>
              </div>

            </registro-content>
            <Button className="btn-gold" onClick={() => navigate("/login")}>
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
