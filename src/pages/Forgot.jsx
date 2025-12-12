import logo from "../assets/LOGO.png";
import forgot from "../assets/forgot.png";
import "../styles/Forgot.css";
import { FaReply } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Forgot() {
    const navigate = useNavigate();

    return (
        <div className="container-forgot">
            {/* PANEL IZQUIERDO */}
            <div className="left-panel-forgot">
                {/* LOGO */}
                <div className="logo-forgot">
                    <img src={logo} alt="Logo" />
                </div>

                <h1>¿Olvidaste tu contraseña?</h1>
                <p className="subtitle-forgot">A todos nos para, aquí te ayudamos</p>

                {/* FORMULARIO */}
                <form className="form-forgot">
                    <input
                        type="email"
                        placeholder="usuario.nombre@gmail.com"
                        required
                    />

                    <button
                        type="button"
                        className="back-login-btn"
                        onClick={() => (window.location.href = "/login")}
                    >
                        Volver al login <FaReply />
                    </button>

                    <button className="btn-send-forgot" type="button" onClick={() => navigate("/login")}>
                        ENVIAR
                    </button>
                </form>
            </div>

            {/* PANEL DERECHO */}
            <div className="right-panel-forgot">
                <div className="container-img-forgot">
                    <img src={forgot} alt="Forgot" className="forgot-img" />
                </div>
            </div>
        </div>
    );
}
