//Imagenes Logo y Calendario
import logo from "../assets/LOGO.png";
import calendario from "../assets/CALENDARIO.png";
import { IoEyeSharp } from "react-icons/io5";

import "../styles/Login.css";
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import '../styles/Login.css'
import { useNavigate } from "react-router-dom";
import { Col } from "react-bootstrap";
import { useState } from "react";
import { FaEyeSlash } from "react-icons/fa";


//useForm/zodResolver/loginSchema
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/loginschema";

export default function Login() {

const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };
  const navigate = useNavigate();

  //Estado para manejar errores del servidor (API)
  const [serverError, setServerError] = useState("");

  //Constante para manejar el formulario con validación usando zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  //Componente para manejar el envío del formulario
  const onSubmit = async (data) => {
    setServerError("");
    try {
      console.log("Enviando...", data);
      // Simulación de retraso (API)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Si la validación pasa, navegamos
      navigate("/home");
    } catch (err) {
      setServerError("Credenciales inválidas o error de conexión");
    }
  };

  return (
    <>
      <div className="container-login">
        {/*PANEL IZQUIERDO*/}
        <div className="left-panel-login">
          {/*LOGO*/}
          <div className="logo-login">
            <img src={logo} alt="Logo" />
          </div>
          <h1 className="title-login">Bienvenido !</h1>
          <p className="subtitle">¿Estas listo para reservar?</p>

          {/* MENSAJE DE ERROR DE API */}
          {serverError && <p className="error-msg">{serverError}</p>}

          {/*FORMULARIO - Conectamos handleSubmit*/}
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <input
                type="email"
                id="email"
                placeholder="Ingrese su email"
                {...register("email")} // Conexión con Zod
              />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder="Ingrese su contraseña"
                {...register("password")} // Conexión con Zod
              />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
                <span className="password-toggle-icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
            </div>

            <div className="options">
              <label className="check">
                <input type="checkbox" />
                <span className="check">Recordarme</span>
              </label>
              <a href="Forgot" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div className="redirect">
              {/* Quitamos el onClick del botón y dejamos que el form maneje el submit */}
              <button type="submit" className="btn-login" disabled={isSubmitting}>
                {isSubmitting ? "CARGANDO..." : "INGRESAR"}
              </button>
              
              <button
                type="button"
                className="btn-login"
                onClick={() => navigate("/register")}
              >
                REGISTRARSE
              </button>
            </div>
          </form>
        </div>

        {/*PANEL DERECHO*/}
        <div className="right-panel-login">
          <div className="container-img">
            <img src={calendario} alt="Calendario" className="calendar-img" />
          </div>
        </div>
      </div>
    </>
  );
}
