import { Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import logo from "../../../assets/LOGO.png";
import "../styles/Auth.css";

/**
 * Plantilla común de las pantallas de acceso (login, registro, olvidé mi
 * contraseña, restablecer y verificar cuenta): imagen a un lado y contenido
 * al otro. En tablet y móvil la imagen pasa a ser una franja superior.
 */
export default function LayoutAuth({ titulo, subtitulo, volver, ancho = "normal", fraseImagen, children }) {
  return (
    <div className="rg-pagina">
      <aside className="rg-imagen" aria-hidden="true">
        <div className="rg-imagen-texto">
          <h2>{fraseImagen?.titulo || "Experiencias inolvidables"}</h2>
          <p>{fraseImagen?.texto || "Reserva canchas y habitaciones en un solo lugar."}</p>
        </div>
      </aside>

      <main className="rg-lado-form">
        <div className={`rg-contenido ${ancho === "angosto" ? "rg-angosto" : ""}`}>
          {volver && <Link to={volver.a} className="rg-volver"><BsArrowLeft /> {volver.texto}</Link>}
          <header className="rg-encabezado">
            <img src={logo} alt="Golden Booking" className="rg-logo" />
            <h1>{titulo}</h1>
            {subtitulo && <p>{subtitulo}</p>}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
