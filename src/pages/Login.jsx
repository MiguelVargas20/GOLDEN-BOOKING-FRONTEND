import logo from "../assets/LOGO.png";
import calendario from "../assets/CALENDARIO.png";
import { IoEyeSharp } from "react-icons/io5";
import "../styles/Login.css";
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import '../styles/Login.css'
import { useNavigate } from "react-router-dom";
import { Col } from "react-bootstrap";
import { useState } from "react";
import { FaEyeSlash } from "react-icons/fa";



export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (

        <Container className="container-login">
            <Row>
                <Col className="left-panel-login">
                    <div className="logo-login">
                        <img src={logo} alt="Logo" />
                    </div>
                    <h1 className="bungee-regular">Bienvenido !</h1>
                    <p className="bungee-regular">¿Estas listo para reservar?</p>
                    <Form className="form">

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Correo electrónico</Form.Label>
                            <Form.Control type="email" placeholder="Dirección de correo electrónico" />
                            <Form.Text className="text-muted">
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3 password-group" controlId="formBasicPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <div className="password-input-wrapper">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                />
                                <span className="password-toggle-icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                    {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                                </span>
                            </div>
                        </Form.Group>

                        <div className="redirect">
                            <Button type="button" className="btn-login bungee-regular" onClick={() => navigate('/home')}>
                                INGRESAR
                            </Button>
                            <Button type="button" className="btn-login bungee-regular" onClick={() => navigate('/register')}>
                                REGISTRARSE
                            </Button>
                        </div>
                    </Form>
                </Col>
                <Col className="right-panel-login">
                    <div className="container-img">
                        <img src={calendario} alt="Calendario" className="calendar-img" />
                    </div>
                </Col>
            </Row>
        </Container>
    )
        ;
}

