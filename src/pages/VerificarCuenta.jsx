import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import Swal from "sweetalert2";

export default function VerificarCuenta() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [estado, setEstado] = useState("cargando"); // cargando | exito | error
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const verificar = async () => {
            if (!token) {
                setEstado("error");
                setMensaje("El enlace no incluye un token válido.");
                return;
            }

            try {
                const respuesta = await fetch(
                    `http://localhost:8080/auth/verificar-cuenta?token=${token}`,
                    { method: "GET" }
                );

                const data = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(data.error || data.mensaje || "No se pudo verificar la cuenta.");
                }

                setEstado("exito");
                setMensaje(data.mensaje || "¡Tu cuenta fue verificada correctamente!");
            } catch (err) {
                setEstado("error");
                setMensaje(err.message || "El enlace no es válido o ya expiró.");
            }
        };

        verificar();
    }, [token]);

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
            <div style={{ background: "#fff", padding: "3rem", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", maxWidth: "420px", textAlign: "center" }}>

                {estado === "cargando" && (
                    <>
                        <div className="spinner-border" style={{ color: "#f68b1e" }} role="status" />
                        <p style={{ marginTop: "1rem", color: "#4a5568" }}>Verificando tu cuenta...</p>
                    </>
                )}

                {estado === "exito" && (
                    <>
                        <BsCheckCircleFill size={56} color="#38a169" />
                        <h4 style={{ marginTop: "1rem", color: "#1a1a2e" }}>¡Listo!</h4>
                        <p style={{ color: "#4a5568" }}>{mensaje}</p>
                        <Link to="/login" className="btn" style={{ background: "#f68b1e", color: "#fff", fontWeight: 600, borderRadius: "10px", padding: "10px 24px", marginTop: "1rem", display: "inline-block" }}>
                            Ir a iniciar sesión
                        </Link>
                    </>
                )}

                {estado === "error" && (
                    <>
                        <BsXCircleFill size={56} color="#e53e3e" />
                        <h4 style={{ marginTop: "1rem", color: "#1a1a2e" }}>No pudimos verificar tu cuenta</h4>
                        <p style={{ color: "#4a5568" }}>{mensaje}</p>
                        <Link to="/login" style={{ color: "#f68b1e", fontWeight: 600 }}>
                            Volver al inicio de sesión
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}