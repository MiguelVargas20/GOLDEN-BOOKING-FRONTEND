import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash, FaReply } from "react-icons/fa";
import logo from '../assets/LOGO.png';
import imagen_register from '../assets/imagen_register.png';
import '../styles/Register.css';
import { registerSchema } from "../schemas/RegisterSchema";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { registro } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    setFieldErrors({});
    try {
      await registro(data);
      navigate("/");
    } catch (err) {
      if (err.errores) setFieldErrors(err.errores);
      setServerError(err.message || "Error al registrar");
    }
  };

  return (
    <div className="register-container">
      {/* PANEL IZQUIERDO */}
      <div className="left-panel-register">
        <div className="logo-register">
          <img src={logo} alt="Logo" />
        </div>

        <h1 className="title-register">Crea tu cuenta</h1>
        <p className="subtitle-register">Regístrate para acceder a tu reserva</p>

        {serverError && <p className="error-msg">{serverError}</p>}

        <form className="form-register" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-row">
            <div className="input-group">
              <input type="text" placeholder="Nombre" {...register("nombre")} />
              {errors.nombre && <span className="error-text">{errors.nombre.message}</span>}
            </div>
            <div className="input-group">
              <input type="text" placeholder="Apellido" {...register("apellido")} />
              {errors.apellido && <span className="error-text">{errors.apellido.message}</span>}
            </div>
          </div>

          <div className="input-group">
            <select {...register("tipoDoc")}>
              <option value="">Tipo de documento</option>
              <option value="CC">Cédula de ciudadanía</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="CE">Cédula de extranjería</option>
            </select>
            {errors.tipoDoc && <span className="error-text">{errors.tipoDoc.message}</span>}
          </div>

          <div className="input-group">
            <input type="text" placeholder="Número de documento" {...register("numeroDoc")} />
            {errors.numeroDoc && <span className="error-text">{errors.numeroDoc.message}</span>}
          </div>

          <div className="input-group">
            <input type="text" placeholder="Username" {...register("username")} />
            {errors.username && <span className="error-text">{errors.username.message}</span>}
          </div>

          <div className="input-group">
            <input type="email" placeholder="usuario@correo.com" {...register("email")} />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...register("password")}
            />
            <span className="eye-icon" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
            </span>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <div className="register-actions">
            <button type="submit" className="btn-register-submit" disabled={isSubmitting}>
              {isSubmitting ? "CARGANDO..." : "REGISTRARSE"}
            </button>
            <button type="button" className="btn-back-login" onClick={() => navigate("/")}>
              Volver al login <FaReply />
            </button>
          </div>
        </form>
      </div>

      {/* PANEL DERECHO */}
      <div className="right-panel-register">
        <div className="image-wrapper-register">
          <img src={imagen_register} alt="Registro" className="register-hero-img" />
        </div>
      </div>
    </div>
  );
}