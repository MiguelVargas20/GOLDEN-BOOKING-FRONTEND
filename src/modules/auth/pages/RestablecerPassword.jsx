import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import LayoutAuth from "../components/LayoutAuth";
import { restablecerPassword } from "../api/authService";

/** Nueva contraseña desde el enlace del correo (?token=...). Mismas reglas que el registro. */
export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) return setError("El enlace no es válido. Solicita uno nuevo.");
    if (nuevaPassword.length < 8 || !/[A-Z]/.test(nuevaPassword) || !/[0-9]/.test(nuevaPassword)) {
      return setError("La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.");
    }
    if (nuevaPassword !== confirmar) return setError("Las contraseñas no coinciden.");

    setGuardando(true);
    try {
      await restablecerPassword({ token, nuevaPassword });
      setExito(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || "El enlace no es válido o ya expiró.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <LayoutAuth titulo="Crea tu nueva contraseña" subtitulo="Escribe una contraseña nueva para tu cuenta."
      volver={{ a: "/login", texto: "Volver al inicio de sesión" }} ancho="angosto">
      {error && <div className="rg-error-servidor" role="alert">{error}</div>}
      {exito ? (
        <div className="rg-exito" role="status">Contraseña restablecida. Te llevamos al inicio de sesión…</div>
      ) : (
        <form onSubmit={enviar} noValidate className="rg-form">
          <div className="rg-campo">
            <label htmlFor="rp-nueva">Nueva contraseña</label>
            <div className="rg-password">
              <input id="rp-nueva" type={verPassword ? "text" : "password"} autoComplete="new-password"
                placeholder="Mínimo 8, una mayúscula y un número" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} />
              <button type="button" onClick={() => setVerPassword((v) => !v)} aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {verPassword ? <FaEyeSlash /> : <IoEyeSharp />}
              </button>
            </div>
          </div>
          <div className="rg-campo">
            <label htmlFor="rp-confirmar">Repite la contraseña</label>
            <input id="rp-confirmar" type={verPassword ? "text" : "password"} autoComplete="new-password"
              value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
          </div>
          <button type="submit" className="rg-enviar" disabled={guardando}>
            {guardando ? "Guardando…" : "Restablecer contraseña"}
          </button>
        </form>
      )}
    </LayoutAuth>
  );
}
