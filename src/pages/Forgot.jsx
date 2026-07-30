import logo from "../assets/LOGO.png";
import forgot from "../assets/forgot.png";
import "../styles/Forgot.css";
import { FaReply } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { solicitarRecuperacion } from "../services/authService";

export default function Forgot() {
    const navigate = useNavigate();
    const [correo, setCorreo] = useState("");
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!correo.trim()) {
            setError("El correo es obligatorio");
            return;
        }

        setLoading(true);
        try {
            await solicitarRecuperacion(correo.trim());
            setExito(true);
        } catch (err) {
            setError(err.message || "Error al solicitar la recuperación");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-forgot">
            {/* PANEL IZQUIERDO */}
            <div className="left-panel-forgot">
                <div className="logo-forgot">
                    <img src={logo} alt="Logo" />
                </div>

                <h1>¿Olvidaste tu contraseña?</h1>
                <p className="subtitle-forgot">Ingresa tu correo y te enviaremos un enlace para restablecerla</p>

                {error && <p className="error-msg">{error}</p>}
                {exito && (
                    <p className="success-msg">
                        ✅ Si el correo está registrado, te enviamos un enlace. Revisa tu bandeja (y spam).
                    </p>
                )}

                {!exito && (
                    <form className="form-forgot" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />

                        <div className="form-actions">
                            <button
                                className="btn-send-forgot"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "ENVIANDO..." : "ENVIAR ENLACE"}
                            </button>

                            <button
                                type="button"
                                className="back-login-btn"
                                onClick={() => navigate("/login")}
                            >
                                Volver al login <FaReply />
                            </button>
                        </div>
                    </form>
                )}
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