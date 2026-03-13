import logo from "../assets/LOGO.png";
import calendario from "../assets/CALENDARIO.png";
import "../styles/Login.css";
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";
import '../styles/Login.css'
import { useNavigate } from "react-router-dom";
import { Col } from "react-bootstrap";


export default function Login() {
    const navigate = useNavigate();

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

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>

                        <Form.Group className="check" controlId="formBasicCheckbox">
                            <Form.Check type="checkbox" label="Recuerdame" />
                        </Form.Group>

                        <div className="redirect">
                            <Button type="submit" className="btn-login" onClick={() => navigate('/home')}>
                                INGRESAR
                            </Button>
                            <Button type="button" className="btn-login" onClick={() => navigate('/register')}>
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

