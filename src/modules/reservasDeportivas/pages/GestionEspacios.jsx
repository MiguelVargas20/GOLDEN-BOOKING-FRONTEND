import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Form, Row, Col, Spinner, Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import {
  BsPlusLg, BsPencil, BsTrash, BsClock, BsPeople, BsCashCoin, BsImage, BsCalendarCheck, BsThreeDotsVertical,
} from "react-icons/bs";
import {
  listarEspacios, crearEspacio, actualizarEspacio, cambiarEstadoEspacio,
  eliminarEspacio, subirImagenEspacio, eliminarImagenEspacio,
} from "../api/EspacioDeportivoApi";
import { imagenEspacio, usarImagenDeRespaldo, validarImagen, DEPORTES_SUGERIDOS } from "../utils/imagenEspacio";
import { pesos } from "../../../shared/utils/formato";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/GestionEspacios.css";

const ESTADOS = {
  ACTIVO: { etiqueta: "Activo", clase: "activo", ayuda: "Visible y reservable." },
  MANTENIMIENTO: { etiqueta: "Mantenimiento", clase: "mantenimiento", ayuda: "Visible, pero no se puede reservar." },
  INACTIVO: { etiqueta: "Inactivo", clase: "inactivo", ayuda: "Oculto para los clientes." },
};


const FORM_VACIO = {
  nombre: "", deporte: "", descripcion: "", capacidad: "", tarifaHora: "",
  horaApertura: "06:00", horaCierre: "22:00", estado: "ACTIVO",
};

/** "06:00:00" o "06:00" → "06:00" (el input type=time usa HH:mm). */
const hhmm = (valor) => (valor ? valor.slice(0, 5) : "");

/**
 * Panel del ADMIN: espacios deportivos (canchas, piscinas, pistas...).
 * Crear, editar, subir imagen, cambiar estado y eliminar.
 */
export default function GestionEspacios() {
  const navigate = useNavigate();
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  // Modal de crear / editar
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null); // espacio en edición (null = creando)
  const [form, setForm] = useState(FORM_VACIO);
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      setEspacios(await listarEspacios());
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // Libera la URL temporal de la vista previa al cambiar de imagen o cerrar
  useEffect(() => () => { if (vistaPrevia) URL.revokeObjectURL(vistaPrevia); }, [vistaPrevia]);

  const conteo = useMemo(() => espacios.reduce((acc, e) => {
    acc[e.estado] = (acc[e.estado] || 0) + 1;
    return acc;
  }, {}), [espacios]);

  const visibles = espacios.filter((e) => {
    const coincideEstado = filtroEstado === "TODOS" || e.estado === filtroEstado;
    const termino = busqueda.trim().toLowerCase();
    const coincideTexto = !termino || `${e.nombre} ${e.deporte}`.toLowerCase().includes(termino);
    return coincideEstado && coincideTexto;
  });

  // ── Modal ───────────────────────────────────────────────
  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setArchivo(null);
    setVistaPrevia(null);
    setMostrarModal(true);
  };

  const abrirEditar = (espacio) => {
    setEditando(espacio);
    setForm({
      nombre: espacio.nombre || "",
      deporte: espacio.deporte || "",
      descripcion: espacio.descripcion || "",
      capacidad: espacio.capacidad ?? "",
      tarifaHora: espacio.tarifaHora ?? "",
      horaApertura: hhmm(espacio.horaApertura),
      horaCierre: hhmm(espacio.horaCierre),
      estado: espacio.estado || "ACTIVO",
    });
    setArchivo(null);
    setVistaPrevia(null);
    setMostrarModal(true);
  };

  const cambiarCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const elegirArchivo = async (e) => {
    const elegido = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!elegido) return;
    // Formato, peso y dimensiones (mismas reglas que el backend)
    const error = await validarImagen(elegido);
    if (error) {
      Swal.fire({ title: "Imagen no válida", text: error, icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }
    setArchivo(elegido);
    setVistaPrevia(URL.createObjectURL(elegido));
  };

  const imagenModal = vistaPrevia || imagenEspacio(editando ? { ...editando, deporte: form.deporte } : { deporte: form.deporte });

  const guardar = async (e) => {
    e.preventDefault();
    if (form.horaCierre <= form.horaApertura) {
      Swal.fire({ title: "Horario inválido", text: "La hora de cierre debe ser posterior a la de apertura.", icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }
    const datos = {
      ...form,
      capacidad: Number(form.capacidad),
      tarifaHora: Number(form.tarifaHora),
    };

    setGuardando(true);
    try {
      const guardado = editando
        ? await actualizarEspacio(editando.id, datos)
        : await crearEspacio(datos);

      if (archivo) {
        try {
          await subirImagenEspacio(guardado.id, archivo);
        } catch (err) {
          // El espacio ya quedó guardado: se avisa solo del problema con la imagen
          await Swal.fire({ title: "Espacio guardado sin imagen", text: err.message, icon: "warning", confirmButtonColor: "#f38d1e" });
        }
      }

      setMostrarModal(false);
      await cargar();
      Swal.fire({
        title: editando ? "Espacio actualizado" : "Espacio creado",
        icon: "success", timer: 1600, showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ title: "No se pudo guardar", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setGuardando(false);
    }
  };

  const quitarImagen = async () => {
    if (!editando?.imagenUrl) return;
    try {
      const actualizado = await eliminarImagenEspacio(editando.id);
      setEditando(actualizado);
      await cargar();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  // ── Acciones de tarjeta ─────────────────────────────────
  const cambiarEstado = async (espacio, estado) => {
    if (espacio.estado === estado) return;
    try {
      await cambiarEstadoEspacio(espacio.id, estado);
      await cargar();
      Swal.fire({
        title: `Espacio ${ESTADOS[estado].etiqueta.toLowerCase()}`,
        text: estado === "ACTIVO" ? "" : "Las reservas ya existentes no se modifican; puedes cancelarlas desde la gestión de reservas.",
        icon: "success", timer: estado === "ACTIVO" ? 1400 : 3500, showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const eliminar = async (espacio) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar espacio?",
      html: `<p><strong>${escapeHtml(espacio.nombre)}</strong> se eliminará permanentemente.</p>
             <p style="font-size:0.85rem;color:#718096">Si tiene reservas en su historial no se puede eliminar: márcalo como <strong>Inactivo</strong>.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#6c757d",
    });
    if (!isConfirmed) return;
    try {
      await eliminarEspacio(espacio.id);
      await cargar();
      Swal.fire({ title: "Espacio eliminado", icon: "success", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: "No se pudo eliminar", text: err.message, icon: "info", confirmButtonColor: "#f38d1e" });
    }
  };

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Espacios <span>deportivos</span></h1>
          <p className="gb-panel-subtitulo">Canchas, piscinas y pistas que los clientes pueden reservar.</p>
        </div>
        <div className="gb-panel-acciones">
          <input
            type="search"
            className="gb-buscador"
            placeholder="Buscar por nombre o deporte..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/reservas-deportivas/gestionar")}>
            <BsCalendarCheck /> Reservas
          </button>
          <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={abrirCrear}>
            <BsPlusLg /> Nuevo espacio
          </button>
        </div>
      </div>

      {/* Filtro por estado */}
      <div className="gb-chips">
        {["TODOS", "ACTIVO", "MANTENIMIENTO", "INACTIVO"].map((estado) => (
          <button
            key={estado}
            type="button"
            className={`gb-chip ${filtroEstado === estado ? "activo" : ""}`}
            onClick={() => setFiltroEstado(estado)}
          >
            {estado === "TODOS" ? "Todos" : ESTADOS[estado].etiqueta}
            <span>{estado === "TODOS" ? espacios.length : conteo[estado] || 0}</span>
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" style={{ color: "#f38d1e" }} /></div>
      ) : visibles.length === 0 ? (
        <div className="gb-vacio">
          <p>No hay espacios {filtroEstado !== "TODOS" ? `en estado ${ESTADOS[filtroEstado].etiqueta.toLowerCase()}` : "registrados"}.</p>
          <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={abrirCrear}><BsPlusLg /> Crear espacio</button>
        </div>
      ) : (
        <div className="ge-grid">
          {visibles.map((e) => (
            <article key={e.id} className={`ge-card ${e.estado !== "ACTIVO" ? "atenuada" : ""}`}>
              <div className="ge-imagen">
                <img src={imagenEspacio(e)} alt={e.nombre} loading="lazy" onError={usarImagenDeRespaldo(e)} />
                <span className={`ge-estado ge-estado-${ESTADOS[e.estado]?.clase}`}>{ESTADOS[e.estado]?.etiqueta}</span>
                <Dropdown className="ge-menu" align="end">
                  <Dropdown.Toggle as="button" className="ge-menu-boton" aria-label="Más acciones">
                    <BsThreeDotsVertical />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>Cambiar estado</Dropdown.Header>
                    {Object.entries(ESTADOS).map(([valor, info]) => (
                      <Dropdown.Item key={valor} active={e.estado === valor} onClick={() => cambiarEstado(e, valor)}>
                        {info.etiqueta} <small className="text-muted d-block">{info.ayuda}</small>
                      </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Item className="text-danger" onClick={() => eliminar(e)}>
                      <BsTrash className="me-2" />Eliminar
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="ge-cuerpo">
                <span className="ge-deporte">{e.deporte}</span>
                <h3 className="ge-nombre">{e.nombre}</h3>
                {e.descripcion && <p className="ge-descripcion">{e.descripcion}</p>}
                <ul className="ge-datos">
                  <li><BsCashCoin /> {pesos(e.tarifaHora)} / hora</li>
                  <li><BsPeople /> Hasta {e.capacidad} personas</li>
                  <li><BsClock /> {hhmm(e.horaApertura)} – {hhmm(e.horaCierre)}</li>
                </ul>
                <button type="button" className="btn-gb btn-gb-secondary btn-gb-sm w-100" onClick={() => abrirEditar(e)}>
                  <BsPencil /> Editar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Modal crear / editar ── */}
      <Modal show={mostrarModal} onHide={() => !guardando && setMostrarModal(false)} size="lg" centered>
        <Form onSubmit={guardar}>
          <Modal.Header closeButton={!guardando}>
            <Modal.Title>{editando ? "Editar espacio" : "Nuevo espacio deportivo"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col md={5}>
                <div className="ge-modal-imagen">
                  <img key={imagenModal} src={imagenModal} alt="Vista previa" onError={usarImagenDeRespaldo({ deporte: form.deporte })} />
                </div>
                <label className="btn-gb btn-gb-secondary btn-gb-sm w-100 mt-2 ge-subir">
                  <BsImage /> {archivo || editando?.imagenUrl ? "Cambiar imagen" : "Subir imagen"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={elegirArchivo} />
                </label>
                {archivo && (
                  <button type="button" className="btn btn-link btn-sm w-100" onClick={() => { setArchivo(null); setVistaPrevia(null); }}>
                    Descartar imagen nueva
                  </button>
                )}
                {!archivo && editando?.imagenUrl && (
                  <button type="button" className="btn btn-link btn-sm w-100 text-danger" onClick={quitarImagen}>
                    Quitar imagen y usar la del deporte
                  </button>
                )}
                <small className="text-muted d-block mt-1">
                  JPG, PNG o WEBP · máximo 5 MB · mínimo 400×300 px (recomendado 1200×800, horizontal).
                  Si no subes una, se usa la imagen del deporte.
                </small>
              </Col>

              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del espacio *</Form.Label>
                  <Form.Control required maxLength={60} value={form.nombre} onChange={cambiarCampo("nombre")}
                    placeholder="Ej.: Cancha de Fútbol 1" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Deporte *</Form.Label>
                  <Form.Control required maxLength={40} list="deportes-sugeridos" value={form.deporte}
                    onChange={cambiarCampo("deporte")} placeholder="Ej.: Fútbol" />
                  <datalist id="deportes-sugeridos">
                    {DEPORTES_SUGERIDOS.map((d) => <option key={d} value={d} />)}
                  </datalist>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control as="textarea" rows={2} maxLength={500} value={form.descripcion}
                    onChange={cambiarCampo("descripcion")} placeholder="Ej.: Cancha sintética con iluminación nocturna." />
                </Form.Group>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tarifa por hora (COP) *</Form.Label>
                      <Form.Control required type="number" min={1} step={1} inputMode="numeric" value={form.tarifaHora}
                        onChange={cambiarCampo("tarifaHora")} placeholder="50000" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Capacidad (personas) *</Form.Label>
                      <Form.Control required type="number" min={1} max={1000} value={form.capacidad}
                        onChange={cambiarCampo("capacidad")} placeholder="22" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Abre *</Form.Label>
                      <Form.Control required type="time" value={form.horaApertura} onChange={cambiarCampo("horaApertura")} />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cierra *</Form.Label>
                      <Form.Control required type="time" value={form.horaCierre} onChange={cambiarCampo("horaCierre")} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select value={form.estado} onChange={cambiarCampo("estado")}>
                    {Object.entries(ESTADOS).map(([valor, info]) => (
                      <option key={valor} value={valor}>{info.etiqueta} — {info.ayuda}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn-gb btn-gb-secondary" onClick={() => setMostrarModal(false)} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
              {guardando ? <><Spinner size="sm" className="me-2" />Guardando...</> : editando ? "Guardar cambios" : "Crear espacio"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
