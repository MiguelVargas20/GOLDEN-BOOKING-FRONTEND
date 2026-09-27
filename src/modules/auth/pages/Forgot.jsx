import { useState } from "react";
import LayoutAuth from "../components/LayoutAuth";
import { solicitarRecuperacion } from "../api/authService";

/** Pide un enlace para restablecer la contraseña (la respuesta es igual exista o no el correo). */
export default function Forgot() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    setEnviando(true);
    try {
      await solicitarRecuperacion(correo.trim());
      setExito(true);
    } catch (err) {
      setError(err.message || "No se pudo solicitar la recuperación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutAuth titulo="¿Olvidaste tu contraseña?" subtitulo="Te enviaremos un enlace para crear una nueva."
      volver={{ a: "/login", texto: "Volver al inicio de sesión" }} ancho="angosto">
      {error && <div className="rg-error-servidor" role="alert">{error}</div>}
      {exito ? (
        <div className="rg-exito" role="status">
          Si el correo está registrado, te enviamos un enlace. Revisa tu bandeja de entrada (y la de spam).
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="rg-form">
          <div className="rg-campo">
            <label htmlFor="fg-correo">Correo electrónico</label>
            <input id="fg-correo" type="email" autoComplete="email" placeholder="usuario@correo.com"
              value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </div>
          <button type="submit" className="rg-enviar" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
    </LayoutAuth>
  );
}
