import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsPencil, BsPersonPlus, BsTrash } from "react-icons/bs";
import { listarUsuarios, eliminarUsuario } from "../api/UserApi";
import Paginador from "../../../shared/components/reservas/Paginador";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";

const TAMANIO_PAGINA = 10;

/** Administración de usuarios (ADMIN): listado, búsqueda, edición y eliminación. */
export default function UsuariosH() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState({ actual: 0, total: 0, elementos: 0 });

  const cargar = useCallback(async (numero = 0) => {
    setCargando(true);
    try {
      const datos = await listarUsuarios(numero, TAMANIO_PAGINA);
      setUsuarios(datos.contenido || []);
      setPagina({ actual: datos.paginaActual ?? 0, total: datos.totalPaginas ?? 0, elementos: datos.totalElementos ?? 0 });
      setError(null);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(0); }, [cargar]);

  const eliminar = async (u) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar usuario?",
      html: `Se eliminará permanentemente a <strong>${escapeHtml(`${u.nombre} ${u.apellido}`)}</strong>. Esta acción no se puede deshacer.`,
      icon: "warning", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53e3e", cancelButtonColor: "#6c757d",
    });
    if (!isConfirmed) return;
    try {
      await eliminarUsuario(u.id);
      await Swal.fire({ title: "Usuario eliminado", icon: "success", timer: 1500, showConfirmButton: false });
      cargar(usuarios.length === 1 && pagina.actual > 0 ? pagina.actual - 1 : pagina.actual);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message || "No se pudo eliminar el usuario.", icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  // Búsqueda dentro de la página actual (nombre, apellido, correo o documento)
  const termino = busqueda.trim().toLowerCase();
  const visibles = termino
    ? usuarios.filter((u) => [u.nombre, u.apellido, u.email, u.documento?.numeroD]
        .some((v) => v?.toLowerCase().includes(termino)))
    : usuarios;

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Gestionar <span>usuarios</span></h1>
          <p className="gb-panel-subtitulo">Datos, rol y estado de las cuentas de clientes y administradores.</p>
        </div>
        <div className="gb-panel-acciones">
          <input type="search" className="gb-buscador" placeholder="Buscar por nombre, correo o documento"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar usuarios" />
          <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/usuarios-crear")}>
            <BsPersonPlus /> Agregar usuario
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="gb-tabla-contenedor">
        <table className="gb-tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Documento</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} className="gb-tabla-vacia"><Spinner size="sm" /> Cargando…</td></tr>
            ) : visibles.length === 0 ? (
              <tr><td colSpan={6} className="gb-tabla-vacia">{termino ? "Ningún usuario coincide con la búsqueda." : "No hay usuarios registrados."}</td></tr>
            ) : visibles.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="gb-celda-principal">{u.nombre} {u.apellido}</span>
                  {u.telefono && <span className="gb-celda-secundaria">{u.telefono}</span>}
                </td>
                <td>{u.documento?.tipo ? `${u.documento.tipo} ` : ""}{u.documento?.numeroD || "—"}</td>
                <td>{u.email}</td>
                <td>{u.roles?.includes("ROL_ADMIN") ? "Administrador" : "Cliente"}</td>
                <td>
                  <span className={`gb-estado ${u.estado === "INACTIVO" ? "gb-estado-cancelada" : "gb-estado-confirmada"}`}>
                    {u.estado === "INACTIVO" ? "Inactivo" : "Activo"}
                  </span>
                </td>
                <td>
                  <div className="gb-acciones-fila">
                    <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm"
                      onClick={() => navigate("/usuarios-edit", { state: { usuario: u } })}>
                      <BsPencil /> Editar
                    </button>
                    <button type="button" className="btn-gb btn-gb-danger btn-gb-sm" onClick={() => eliminar(u)}
                      aria-label={`Eliminar a ${u.nombre} ${u.apellido}`}>
                      <BsTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginador pagina={pagina.actual} totalPaginas={pagina.total} totalElementos={pagina.elementos}
        etiqueta="usuarios" onCambiar={cargar} />
    </div>
  );
}
