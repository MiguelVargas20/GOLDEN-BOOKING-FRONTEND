import logo from '../assets/LOGO.png'
import calendario from '../assets/CALENDARIO.png'
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import '../styles/Login.css'

export default function Login() {
    return (
        <Container fluid className="login-container">
            <Row>
                {/* PANEL IZQUIERDO */}
                <Col className="left-panel">
                    <div className="logo">
                        <img src={logo} alt="Logo" />
                    </div>

                    <h1>Bienvenido !</h1>
                    <p className="subtitle">¿Estas listo para reservar?</p>

                    <form className="form">
                        <input type="email" placeholder="Ingrese su email" required />
                        <input type="password" placeholder="Ingrese su contraseña" required />

                        <div className="options">
                            <label>
                                <input type="checkbox" />
                                <span>Recordarme</span>
                            </label>

                            <a href="/Forgot">¿Olvidaste tu contraseña?</a>
                        </div>

                        <button className="btn" type="submit">
                            INGRESAR
                        </button>
                    </form>
                </Col>
            </Row>
                {/* PANEL DERECHO */}
            <Row>    
                <Col  className="right-panel">
                    <img src={calendario} alt="Calendario" className="calendar-img" />
                </Col>
            </Row>
        </Container>
    );
}
