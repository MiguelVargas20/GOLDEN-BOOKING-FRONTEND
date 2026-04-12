import { IoEyeSharp } from "react-icons/io5";
import calendario from "../assets/CALENDARIO.png";
import logo from "../assets/LOGO.png";
import "../styles/Login.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../schemas/loginschema";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await login(data);
      navigate("/home");
    } catch (err) {
      setServerError(err.message || "Credenciales inválidas");
    }
  };

  return (
    <>
      <div className="container-login">
        <div className="left-panel-login">
          <div className="logo-login">
            <img src={logo} alt="Logo" />
          </div>
          <h1 className="title-login">Bienvenido !</h1>
          <p className="subtitle">¿Estas listo para reservar?</p>

          {serverError && <p className="error-msg">{serverError}</p>}

          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Ingrese su usuario"
                {...register("username")}
              />
              {errors.username && <span className="error-text">{errors.username.message}</span>}
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingrese su contraseña"
                {...register("password")}
              />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
              <span className="password-toggle-icon" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
              </span>
            </div>

            <div className="options">
              <label className="check">
                <input type="checkbox" />
                <span className="check">Recordarme</span>
              </label>
              <a href="Forgot" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <div className="redirect">
              <button type="submit" className="btn-login" disabled={isSubmitting}>
                {isSubmitting ? "CARGANDO..." : "INGRESAR"}
              </button>
              <button type="button" className="btn-login" onClick={() => navigate("/register")}>
                REGISTRARSE
              </button>
            </div>
          </form>
        </div>

        <div className="right-panel-login">
          <div className="container-img">
            <img src={calendario} alt="Calendario" className="calendar-img" />
          </div>
        </div>
      </div>
    </>
  );
}