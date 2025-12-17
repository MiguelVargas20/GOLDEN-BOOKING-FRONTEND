import logo from "../assets/LOGO.png";
import calendario from "../assets/CALENDARIO.png";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    return (
        <>
            <div className="container-login">
                {/*PANEL IZQUIERDO*/}
                <div className="left-panel-login">
                    {/*LOGO*/}
                    <div className="logo-login">
                        <img src={logo} alt="Logo" />
                    </div>
                    <h1 className="title-login">Bienvenido !</h1>
                    <p className="subtitle">¿Estas listo para reservar?</p>
                    {/*FORMULARIO*/}
                    <form className="form">
                        <input
                            type="email"
                            id="email"
                            placeholder="Ingrese su email"
                            required
                        />
                        <input
                            type="password"
                            id="password"
                            placeholder="Ingrese su contraseña"
                            required
                        />
                        <div className="options">
                            <label className="check">
                                <input type="checkbox" />
                                <span className="check">Recordarme</span>
                            </label>
                            <a href="Forgot" className="forgot-link">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                        <div className="redirect">
                            <button type="submit" className="btn-login" onClick={() => navigate('/home')}>
                                INGRESAR
                            </button>
                            <button type="button" className="btn-login" onClick={() => navigate('/register')}>
                                REGISTRARSE
                            </button>
                        </div>
                    </form>
                </div>

                {/*PANEL DERECHO*/}
                <div className="right-panel-login">
                    <div className="container-img">
                        <img src={calendario} alt="Calendario" className="calendar-img" />
                    </div>
                </div>
            </div>
        </>
    );
}
