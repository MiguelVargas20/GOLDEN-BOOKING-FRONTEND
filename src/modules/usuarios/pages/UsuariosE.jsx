import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { BsArrowLeft } from "react-icons/bs";
import { actualizarUsuario } from "../api/UserApi";
import { useAuth } from "../../../shared/context/AuthContext";
import FormularioUsuario from "../components/FormularioUsuario";
import { aFormulario, aDatosUsuario } from "../utils/formularioUsuario";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/FormularioUsuario.css";

/**
 * Edición completa de un usuario por el ADMIN. El backend valida todo otra
 * vez (correo y documento únicos, formatos) y, si cambia el número de
 * documento, traslada sus reservas. Un admin no puede quitarse su propio rol
 * ni desactivarse.
 */
export default function UsuariosE() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const usuario = state?.usuario;

  const [valores, setValores] = useState(() => (usuario ? aFormulario(usuario) : null));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  if (!usuario) {
    return (
      <div className="gb-panel">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          No se seleccionó ningún usuario.
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/usuarios")}>Volver</button>
        </div>
      </div>
    );
  }

  const esMiCuenta = user?.id === usuario.id;
  const cambiaDocumento = valores.numeroDocumento.trim() !== (usuario.documento?.numeroD || "");

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (cambiaDocumento) {
      const { isConfirmed } = await Swal.fire({
        title: "¿Cambiar el número de documento?",
        text: "Las reservas de este usuario se moverán al nuevo número de documento.",
        icon: "warning", showCancelButton: true, confirmButtonText: "Sí, cambiarlo", cancelButtonText: "Revisar",
        confirmButtonColor: "#f38d1e",
      });
      if (!isConfirmed) return;
    }

    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id, {
        ...aDatosUsuario(valores),
        estado: valores.estado,
        roles: [valores.rol],
      });
      await Swal.fire({ title: "Usuario actualizado", icon: "success", timer: 1500, showConfirmButton: false });
      navigate("/usuarios");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el usuario.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Editar <span>usuario</span></h1>
          <p className="gb-panel-subtitulo">{usuario.nombre} {usuario.apellido} · {usuario.email}</p>
        </div>
        <div className="gb-panel-acciones">
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/usuarios")}>
            <BsArrowLeft /> Volver
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {esMiCuenta && <div className="alert alert-info py-2">Es tu cuenta: no puedes cambiar tu propio rol ni desactivarte.</div>}
      {cambiaDocumento && <div className="alert alert-warning py-2">Al guardar, las reservas de este usuario se moverán al nuevo número de documento.</div>}

      <div className="gb-tarjeta">
        <FormularioUsuario modo="editar" valores={valores} onCambio={setValores} onEnviar={enviar}
          onCancelar={() => navigate("/usuarios")} guardando={guardando} bloquearCuenta={esMiCuenta}
          textoEnviar="Guardar cambios" />
      </div>
    </div>
  );
}
