import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import logo from "../assets/LOGO.png";
import forgot from "../assets/forgot.png";
import "../styles/Forgot.css";
import "../styles/BotonesCompartidos.css";
import { restablecerPassword } from "../services/authService";

export default function RestablecerPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [error, setError] = useState("");
    const [exito, setExito] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("El enlace no es válido. Solicita uno nuevo.");
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

        setLoading(true);
        try {
            await restablecerPassword({ token, nuevaPassword });
            setExito(true);
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setError(err.message || "El enlace no es válido o ya expiró");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-forgot">
            <div className="left-panel-forgot">
                <div className="logo-forgot">
                    <img src={logo} alt="Logo" />
                </div>

                <h1>Crea tu nueva contraseña</h1>
                <p className="subtitle-forgot">Escribe una contraseña nueva para tu cuenta</p>

                {error && <p className="error-msg">{error}</p>}
                {exito && (
                    <p className="success-msg">
                        ✅ Contraseña restablecida. Redirigiendo al login...
                    </p>
                )}

                {!exito && (
                    <form className="form-forgot" onSubmit={handleSubmit}>
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
                                className="btn-gb btn-gb-primary btn-gb-lg"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "GUARDANDO..." : "RESTABLECER"}
                            </button>

                            <Link to="/login" className="back-login-btn">
                                Volver al login
                            </Link>
                        </div>
                    </form>
                )}
            </div>

            <div className="right-panel-forgot">
                <div className="container-img-forgot">
                    <img src={forgot} alt="Restablecer" className="forgot-img" />
                </div>
            </div>
        </div>
    );
}