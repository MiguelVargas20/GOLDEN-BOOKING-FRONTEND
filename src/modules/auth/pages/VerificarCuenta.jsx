import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import LayoutAuth from "../components/LayoutAuth";
import { extraerMensajeError } from "../../../shared/api/apiUtils";

/** Confirma la cuenta con el enlace del correo (?token=...). */
export default function VerificarCuenta() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState("");
  const yaVerificado = useRef(false); // en desarrollo React ejecuta el efecto dos veces: el token solo sirve una vez

  useEffect(() => {
    if (yaVerificado.current) return;
    yaVerificado.current = true;

    const verificar = async () => {
      if (!token) {
        setEstado("error");
        setMensaje("El enlace no incluye un token válido.");
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verificar-cuenta?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo verificar la cuenta."));
        const datos = await res.json();
        setEstado("exito");
        setMensaje(datos.mensaje || "¡Tu cuenta fue verificada correctamente!");
      } catch (err) {
        setEstado("error");
        setMensaje(err.message || "El enlace no es válido o ya expiró.");
      }
    };
    verificar();
  }, [token]);

  return (
    <LayoutAuth titulo="Verificación de cuenta" ancho="angosto">
      {estado === "cargando" && (
        <div className="rg-estado" role="status">
          <div className="spinner-border" style={{ color: "var(--gb-primary)" }} />
          <p className="mt-3">Verificando tu cuenta…</p>
        </div>
      )}
      {estado === "exito" && (
        <div className="rg-estado ok">
          <BsCheckCircleFill aria-hidden="true" />
          <p>{mensaje}</p>
          <Link to="/login" className="rg-enviar d-inline-block text-decoration-none">Ir a iniciar sesión</Link>
        </div>
      )}
      {estado === "error" && (
        <div className="rg-estado error">
          <BsXCircleFill aria-hidden="true" />
          <p>{mensaje}</p>
          <Link to="/login" className="rg-enlace">Volver al inicio de sesión</Link>
        </div>
      )}
    </LayoutAuth>
  );
}
