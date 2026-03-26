import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";

// Assets y Styles
import logo from '../assets/LOGO.png';
import imagen_register from '../assets/imagen_register.png';
import '../styles/Register.css';

// Schema
import { registerSchema } from "../schemas/RegisterSchema";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Configuración de useForm
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // Función onSubmit (Redirección corregida)
  const onSubmit = async (data) => {
    setServerError("");
    try {
      console.log("Enviando registro...", data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Aquí es donde sucede la magia
      navigate("/home"); 
    } catch (err) {
      setServerError("Error en el servidor al crear cuenta");
    }
  };

  return (
    <div className="container-login"> {/* Usamos tus clases de login para mantener consistencia */}
      {/* PANEL IZQUIERDO */}
      <div className="left-panel-login">
        <div className="logo-login">
          <img src={logo} alt="Logo" />
        </div>
        
        <h1 className="title-login">Crea tu cuenta</h1>
        <p className="subtitle">Regístrate para acceder a tu reserva</p>

        {serverError && <p className="error-msg text-danger">{serverError}</p>}

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Nombre" 
              {...register("nombre")} 
            />
            {errors.nombre && <span className="error-text">{errors.nombre.message}</span>}
          </div>

          <div className="input-group">
            <input 
              type="text" 
              placeholder="Apellido" 
              {...register("apellido")} 
            />
            {errors.apellido && <span className="error-text">{errors.apellido.message}</span>}
          </div>

          <div className="input-group">
            <select className="form-select" {...register("tipoDoc")}>
              <option value="">Tipo de documento</option>
              <option value="CC">Cédula de ciudadanía</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="CE">Cédula de extranjería</option>
            </select>
            {errors.tipoDoc && <span className="error-text">{errors.tipoDoc.message}</span>}
          </div>

          <div className="input-group">
            <input 
              type="email" 
              placeholder="usuario.nombre@gmail.com" 
              {...register("email")} 
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...register("password")}
            />
            <span 
              className="password-toggle-icon" 
              onClick={togglePasswordVisibility}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
            </span>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <div className="redirect">
            <button type="submit" className="btn-login" disabled={isSubmitting}>
              {isSubmitting ? "CARGANDO..." : "REGISTRARSE"}
            </button>
            
            <button
              type="button"
              className="btn-login secondary" // Un estilo diferente para volver
              onClick={() => navigate("/")}
            >
              VOLVER AL LOGIN
            </button>
          </div>
        </form>
      </div>

      {/* PANEL DERECHO */}
      <div className="right-panel-login">
        <div className="container-img">
          <img src={imagen_register} alt="Registro" className="calendar-img" />
        </div>
      </div>
    </div>
  );
}