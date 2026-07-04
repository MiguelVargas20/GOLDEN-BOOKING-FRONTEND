import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash, FaReply } from "react-icons/fa";
import logo from '../assets/LOGO.png';
import '../styles/Register.css';
import { registerSchema } from "../schemas/RegisterSchema";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { registro } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await registro(data);
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Error al registrar");
    }
  };

  return (
    <div className="register-page">
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <div className="form-side">
        <div className="form-content">
          <header className="register-header">
            <img src={logo} alt="Golden Booking Logo" className="main-logo" />
            <h1 className="register-title">Crea tu cuenta</h1>
            <p className="register-subtitle">Regístrate para gestionar tus reservas de lujo</p>
          </header>

          {serverError && <div className="server-error-banner">{serverError}</div>}

          <form className="professional-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="input-grid">
              <div className="field-group">
                <label>Nombre</label>
                <input type="text" placeholder="Ej: Juan" {...register("nombre")} className={errors.nombre ? "input-error" : ""} />
                {errors.nombre && <span className="helper-text">{errors.nombre.message}</span>}
              </div>

              <div className="field-group">
                <label>Apellido</label>
                <input type="text" placeholder="Ej: Pérez" {...register("apellido")} className={errors.apellido ? "input-error" : ""} />
                {errors.apellido && <span className="helper-text">{errors.apellido.message}</span>}
              </div>

              <div className="field-group">
                <label>Tipo de documento</label>
                <select {...register("tipoDoc")} className={errors.tipoDoc ? "input-error" : ""}>
                  <option value="">Seleccione...</option>
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="CE">Cédula de extranjería</option>
                </select>
                {errors.tipoDoc && <span className="helper-text">{errors.tipoDoc.message}</span>}
              </div>

              <div className="field-group">
                <label>Número de documento</label>
                <input type="text" placeholder="123456..." {...register("numeroDoc")} className={errors.numeroDoc ? "input-error" : ""} />
                {errors.numeroDoc && <span className="helper-text">{errors.numeroDoc.message}</span>}
              </div>

              <div className="field-group">
                <label>Nombre de usuario</label>
                <input type="text" placeholder="juanp123" {...register("username")} className={errors.username ? "input-error" : ""} />
                {errors.username && <span className="helper-text">{errors.username.message}</span>}
              </div>

              <div className="field-group">
                <label>Correo electrónico</label>
                <input type="email" placeholder="usuario@correo.com" {...register("email")} className={errors.email ? "input-error" : ""} />
                {errors.email && <span className="helper-text">{errors.email.message}</span>}
              </div>
            </div>

            <div className="field-group full-width">
              <label>Contraseña</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  className={errors.password ? "input-error" : ""}
                />
                <button type="button" className="eye-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                </button>
              </div>
              {errors.password && <span className="helper-text">{errors.password.message}</span>}
            </div>

            <div className="form-footer">
              <button type="submit" className="submit-gold-btn" disabled={isSubmitting}>
                {isSubmitting ? "PROCESANDO..." : "REGISTRARSEHORA"}
              </button>
              <button type="button" className="back-link" onClick={() => navigate("/")}>
                <FaReply /> Volver al inicio de sesión
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECCIÓN DERECHA: IMAGEN PROFESIONAL */}
      <div className="image-side">
        <div className="image-overlay">
          <h2>Experiencias inolvidables</h2>
          <p>Tu próxima reserva en Golden Booking está a un paso.</p>
        </div>
      </div>
    </div>
  );
}