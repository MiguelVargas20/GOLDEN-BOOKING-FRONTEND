import { useState } from "react";
import Form from "react-bootstrap/Form";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/Register.css';
import '../styles/Login.css'
import imagen_register from '../assets/imagen_register.png';
import logo from '../assets/LOGO.png'
import { useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";


function Register() {
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setVerPass((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setVerConfirm((prev) => !prev);
  };

  return (
    <Row className="register-content">
      <Col>
        <div className="left-panel-register">
          <Form className="login-form px-3">
            <Row>
              <header className="site-header">
                <img src={logo} alt="logo" className="site-logo" />
              </header>
            </Row>

            <Row className="justify-content-center align-items-center form-container mx-3">
              <div className="page-heading">
                <h1 className="bungee-regular">Crea tu cuenta</h1>
                <p className="bungee-regular"> Registrate para acceder a tu reserva</p>
              </div>

              <registro-content className="form-register">

                <Form.Group className="mb-2" controlId="formBasicName">
                  <Form.Control className="inp" type="text" placeholder="Nombre " />
                </Form.Group>

                <Form.Group className="mb-2" controlId="formBasicName">
                  <Form.Control className="inp" type="text" placeholder="Apellido " />
                </Form.Group>

                <Form.Select className="inp"  controlId="formBasicDocumentType" placeholder="Tipo de documento">
                  <option value="CC">Cédula de ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de identidad (TI)</option>
                  <option value="CE">Cédula de extranjería (CE)</option>
                  <option value="PP">Pasaporte (PP)</option>
                </Form.Select>

                <Form.Group className="mb-2" controlId="formBasicEmail">
                  <Form.Control className="inp" type="email" placeholder="usuario.nombre@gmail.com" />
                </Form.Group>
                {/* CONTRASEÑA */}
                <div className="input-wrapper password-input-wrapper">
                  <Form.Control
                    className="inp"
                    type={verPass ? "text" : "password"}
                    placeholder="Contraseña"
                  />
                  <span className="password-toggle-icon-registro" onClick={togglePasswordVisibility}>
                    {verPass ? <FaEyeSlash /> : <IoEyeSharp />}
                  </span>
                </div>

                {/* CONFIRMAR CONTRASEÑA */}
                <div className="input-wrapper password-input-wrapper">
                  <Form.Control
                    className="inp"
                    type={verConfirm ? "text" : "password"}
                    placeholder="Confirmar Contraseña"
                  />
                  <span className="password-toggle-icon-registro" onClick={toggleConfirmPasswordVisibility}>
                    {verConfirm ? <FaEyeSlash /> : <IoEyeSharp />}
                  </span>
                </div>

              </registro-content>
              <button type="button" className="btn-register bungee-regular" onClick={() => navigate("/login")}>
                REGISTRARME
              </button>

            </Row>
          </Form>
        </div>
      </Col>
      <Col className="right-panel-register">
        <div className="logo-container-register ">
          <img src={imagen_register} alt="imagen_register" className="click-img" />
        </div>
      </Col>
    </Row>
  );
}

export default Register;
