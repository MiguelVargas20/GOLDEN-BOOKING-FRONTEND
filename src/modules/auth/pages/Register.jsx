import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import logo from "../../../assets/LOGO.png";
import "../styles/Register.css";
import { registerSchema } from "../schemas/RegisterSchema";
import { useAuth } from "../../../shared/context/AuthContext";

const HOY = (() => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();

/** Campo con etiqueta y mensaje de error debajo. */
function Campo({ id, etiqueta, error, opcional, children, ancho = "" }) {
  return (
    <div className={`rg-campo ${ancho}`}>
      <label htmlFor={id}>
        {etiqueta} {opcional && <span className="rg-opcional">(opcional)</span>}
      </label>
      {children}
      {error && <span className="rg-error" role="alert">{error.message}</span>}
    </div>
  );
}

/**
 * Registro de clientes: datos personales, contacto, dirección y cuenta.
 * Las reglas son las mismas del backend (RegisterSchema ↔ UsuarioRegistroDto).
 */
export default function Register() {
  const navigate = useNavigate();
  const { registro } = useAuth();
  const [verPassword, setVerPassword] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { pais: "Colombia", tipoDoc: "CC" } });

  const campo = (nombre) => ({
    id: `rg-${nombre}`,
    ...register(nombre),
    "aria-invalid": errors[nombre] ? "true" : "false",
    className: errors[nombre] ? "rg-invalido" : "",
  });

  const onSubmit = async (datos) => {
    setErrorServidor("");
    try {
      await registro(datos);
      await Swal.fire({
        icon: "success",
        title: "¡Cuenta creada!",
        text: "Te enviamos un correo para verificar tu cuenta. Revisa tu bandeja (y la de spam) antes de iniciar sesión.",
        confirmButtonColor: "#f38d1e",
      });
      navigate("/login");
    } catch (err) {
      setErrorServidor(err.message || "No se pudo completar el registro.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="rg-pagina">
      <aside className="rg-imagen" aria-hidden="true">
        <div className="rg-imagen-texto">
          <h2>Experiencias inolvidables</h2>
          <p>Reserva canchas y habitaciones en un solo lugar.</p>
        </div>
      </aside>

      <main className="rg-lado-form">
        <div className="rg-contenido">
          <Link to="/login" className="rg-volver"><BsArrowLeft /> Volver al inicio de sesión</Link>

          <header className="rg-encabezado">
            <img src={logo} alt="Golden Booking" className="rg-logo" />
            <h1>Crea tu cuenta</h1>
            <p>Completa tus datos para empezar a reservar.</p>
          </header>

          {errorServidor && <div className="rg-error-servidor" role="alert">{errorServidor}</div>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="rg-form">
            <fieldset>
              <legend>Datos personales</legend>
              <div className="rg-rejilla">
                <Campo id="rg-nombre" etiqueta="Nombre" error={errors.nombre}>
                  <input type="text" autoComplete="given-name" placeholder="Juan" {...campo("nombre")} />
                </Campo>
                <Campo id="rg-apellido" etiqueta="Apellido" error={errors.apellido}>
                  <input type="text" autoComplete="family-name" placeholder="Pérez" {...campo("apellido")} />
                </Campo>
                <Campo id="rg-tipoDoc" etiqueta="Tipo de documento" error={errors.tipoDoc}>
                  <select {...campo("tipoDoc")}>
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </Campo>
                <Campo id="rg-numeroDoc" etiqueta="Número de documento" error={errors.numeroDoc}>
                  <input type="text" inputMode="numeric" placeholder="1012345678" {...campo("numeroDoc")} />
                </Campo>
                <Campo id="rg-fechaNacimiento" etiqueta="Fecha de nacimiento" error={errors.fechaNacimiento}>
                  <input type="date" max={HOY} min="1900-01-01" autoComplete="bday" {...campo("fechaNacimiento")} />
                </Campo>
              </div>
            </fieldset>

            <fieldset>
              <legend>Contacto</legend>
              <div className="rg-rejilla">
                <Campo id="rg-email" etiqueta="Correo electrónico" error={errors.email}>
                  <input type="email" autoComplete="email" placeholder="usuario@correo.com" {...campo("email")} />
                </Campo>
                <Campo id="rg-telefono" etiqueta="Teléfono" error={errors.telefono}>
                  <input type="tel" autoComplete="tel" inputMode="tel" placeholder="3001234567" {...campo("telefono")} />
                </Campo>
              </div>
            </fieldset>

            <fieldset>
              <legend>Dirección</legend>
              <div className="rg-rejilla">
                <Campo id="rg-calle" etiqueta="Calle" opcional error={errors.calle}>
                  <input type="text" placeholder="Calle 45" {...campo("calle")} />
                </Campo>
                <Campo id="rg-carrera" etiqueta="Carrera" opcional error={errors.carrera}>
                  <input type="text" placeholder="Carrera 12 # 34-56" {...campo("carrera")} />
                </Campo>
                <Campo id="rg-ciudad" etiqueta="Ciudad" error={errors.ciudad}>
                  <input type="text" autoComplete="address-level2" placeholder="Bogotá" {...campo("ciudad")} />
                </Campo>
                <Campo id="rg-pais" etiqueta="País" error={errors.pais}>
                  <input type="text" autoComplete="country-name" {...campo("pais")} />
                </Campo>
              </div>
            </fieldset>

            <fieldset>
              <legend>Cuenta</legend>
              <div className="rg-rejilla">
                <Campo id="rg-username" etiqueta="Nombre de usuario" error={errors.username} ancho="rg-completo">
                  <input type="text" autoComplete="username" placeholder="juanp123" {...campo("username")} />
                </Campo>
                <Campo id="rg-password" etiqueta="Contraseña" error={errors.password}>
                  <div className="rg-password">
                    <input type={verPassword ? "text" : "password"} autoComplete="new-password"
                      placeholder="Mínimo 8, una mayúscula y un número" {...campo("password")} />
                    <button type="button" onClick={() => setVerPassword((v) => !v)}
                      aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                      {verPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                    </button>
                  </div>
                </Campo>
                <Campo id="rg-confirmarPassword" etiqueta="Repite la contraseña" error={errors.confirmarPassword}>
                  <input type={verPassword ? "text" : "password"} autoComplete="new-password" {...campo("confirmarPassword")} />
                </Campo>
              </div>
            </fieldset>

            <button type="submit" className="rg-enviar" disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
            </button>
            <p className="rg-pie">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </form>
        </div>
      </main>
    </div>
  );
}
