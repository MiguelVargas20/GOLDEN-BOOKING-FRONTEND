import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { BsArrowLeft } from "react-icons/bs";
import { crearUsuarioAdmin } from "../api/UserApi";
import FormularioUsuario from "../components/FormularioUsuario";
import { aFormulario, aDatosUsuario } from "../utils/formularioUsuario";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/FormularioUsuario.css";

/**
 * Crear usuario desde el panel (ADMIN). La cuenta queda con el rol elegido
 * y ya verificada (no necesita confirmar el correo).
 */
export default function UsuariosC() {
  const navigate = useNavigate();
  const [valores, setValores] = useState(() => aFormulario());
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearUsuarioAdmin({
        ...aDatosUsuario(valores),
        username: valores.username.trim(),
        password: valores.password,
      }, valores.rol);
      await Swal.fire({ title: "Usuario creado", text: "Ya puede iniciar sesión.", icon: "success", timer: 1800, showConfirmButton: false });
      navigate("/usuarios");
    } catch (err) {
      setError(err.message || "No se pudo crear el usuario.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Crear <span>usuario</span></h1>
          <p className="gb-panel-subtitulo">La cuenta queda activa y verificada, con el rol que elijas.</p>
        </div>
        <div className="gb-panel-acciones">
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/usuarios")}>
            <BsArrowLeft /> Volver
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="gb-tarjeta">
        <FormularioUsuario modo="crear" valores={valores} onCambio={setValores} onEnviar={enviar}
          onCancelar={() => navigate("/usuarios")} guardando={guardando} textoEnviar="Crear usuario" />
      </div>
    </div>
  );
}
