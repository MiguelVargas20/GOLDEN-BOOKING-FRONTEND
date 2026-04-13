import logo from "../assets/LOGO.png";
import forgot from "../assets/forgot.png";
import "../styles/Forgot.css";
import { FaReply } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { recuperarPassword } from "../services/authService";

export default function Forgot() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordAntigua, setPasswordAntigua] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim()) {
            setError("El username es obligatorio");
            return;
        }
        if (nuevaPassword.length < 6) {
            setError("La contraseña debe tener mínimo 6 caracteres");
            return;
        }
        if (nuevaPassword !== confirmar) {
            setError("Las contraseñas no coinciden");
            return;
        }
        if (!passwordAntigua.trim()) {
            setError("La contraseña actual es obligatoria");
            return;
        }

        setLoading(true);
        try {
            await recuperarPassword({ username, passwordAntigua, nuevaPassword });
            setExito(true);
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setError(err.message || "Error al actualizar la contraseña");
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
                <p className="subtitle-forgot">Ingresa tu usuario y crea una nueva contraseña</p>

                {error && <p className="error-msg">{error}</p>}
                {exito && (
                    <p className="success-msg">
                        ✅ Contraseña actualizada. Redirigiendo al login...
                    </p>
                )}

                <form className="form-forgot" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Tu username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña actual"
                        value={passwordAntigua}
                        onChange={(e) => setPasswordAntigua(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={confirmar}
                        onChange={(e) => setConfirmar(e.target.value)}
                        required
                    />

                    <div className="form-actions">
                        <button
                            className="btn-send-forgot"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "ACTUALIZANDO..." : "ACTUALIZAR"}
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