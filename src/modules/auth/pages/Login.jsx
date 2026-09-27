import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import LayoutAuth from "../components/LayoutAuth";
import { loginSchema } from "../schemas/LoginSchema";
import { useAuth } from "../../../shared/context/AuthContext";

/** Inicio de sesión con usuario y contraseña ("Recordarme" guarda la sesión en el navegador). */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [verPassword, setVerPassword] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");
  const [recordarme, setRecordarme] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (datos) => {
    setErrorServidor("");
    try {
      await login(datos, recordarme);
      navigate("/home");
    } catch (err) {
      setErrorServidor(err.message || "Usuario o contraseña incorrectos.");
    }
  };

  return (
    <LayoutAuth titulo="¡Bienvenido!" subtitulo="Inicia sesión para reservar." ancho="angosto">
      {errorServidor && <div className="rg-error-servidor" role="alert">{errorServidor}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="rg-form">
        <div className="rg-campo">
          <label htmlFor="lg-username">Usuario</label>
          <input id="lg-username" type="text" autoComplete="username" placeholder="Tu nombre de usuario"
            className={errors.username ? "rg-invalido" : ""} {...register("username")} />
          {errors.username && <span className="rg-error" role="alert">{errors.username.message}</span>}
        </div>

        <div className="rg-campo">
          <label htmlFor="lg-password">Contraseña</label>
          <div className="rg-password">
            <input id="lg-password" type={verPassword ? "text" : "password"} autoComplete="current-password"
              placeholder="Tu contraseña" className={errors.password ? "rg-invalido" : ""} {...register("password")} />
            <button type="button" onClick={() => setVerPassword((v) => !v)}
              aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {verPassword ? <FaEyeSlash /> : <IoEyeSharp />}
            </button>
          </div>
          {errors.password && <span className="rg-error" role="alert">{errors.password.message}</span>}
        </div>

        <div className="rg-opciones">
          <label className="rg-check">
            <input type="checkbox" checked={recordarme} onChange={(e) => setRecordarme(e.target.checked)} /> Recordarme
          </label>
          {/* Antes era <a href="Forgot">: recargaba toda la página */}
          <Link to="/forgot" className="rg-enlace">¿Olvidaste tu contraseña?</Link>
        </div>

        <button type="submit" className="rg-enviar" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </button>
        <button type="button" className="rg-secundario" onClick={() => navigate("/register")}>
          Crear una cuenta
        </button>
      </form>
    </LayoutAuth>
  );
}
