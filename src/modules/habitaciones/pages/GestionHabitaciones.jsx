import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Modal, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsPencil, BsTrash, BsPlusLg, BsTags } from "react-icons/bs";
import {
  listarHabitaciones, actualizarHabitacion, eliminarHabitacion, listarTiposHabitacion,
  subirImagenHabitacion, eliminarImagenHabitacion,
} from "../api/HabitacionApi";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import { pesos } from "../../../shared/utils/formato";
import Paginador from "../../../shared/components/reservas/Paginador";
import SelectorImagen from "../../../shared/components/SelectorImagen";
import { datosTipo } from "../utils/tipoHabitacion";
import { imagenHabitacion, usarImagenDeRespaldoHabitacion } from "../utils/imagenHabitacion";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/GestionHabitaciones.css";

const TAMANIO_PAGINA = 8;

// Mismos valores que el enum del backend (antes iban en minúscula y guardar fallaba)
const ESTADOS = {
  DISPONIBLE: { etiqueta: "Disponible", clase: "gb-estado-confirmada" },
  OCUPADA: { etiqueta: "Ocupada", clase: "gb-estado-cancelada" },
  MANTENIMIENTO: { etiqueta: "Mantenimiento", clase: "gb-estado-pendiente" },
};

const FORM_VACIO = { numeroHabitacion: "", precioNoche: "", estadoHabitacion: "DISPONIBLE", descripcion: "", idTipo: "" };

/** Administración de habitaciones (ADMIN): listado, edición con imagen y eliminación. */
export default function GestionHabitaciones() {
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [pagina, setPagina] = useState({ actual: 0, total: 0, elementos: 0 });

  // Modal de edición
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [imagenNueva, setImagenNueva] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async (numero = 0) => {
    setCargando(true);
    try {
      const [datos, listaTipos] = await Promise.all([listarHabitaciones(numero, TAMANIO_PAGINA), listarTiposHabitacion()]);
      setHabitaciones(datos.contenido || []);
      setPagina({ actual: datos.paginaActual ?? 0, total: datos.totalPaginas ?? 0, elementos: datos.totalElementos ?? 0 });
      setTipos(listaTipos);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message || "No se pudieron cargar las habitaciones.", icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(0); }, [cargar]);

  const abrirEdicion = (hab) => {
    setEditando(hab);
    setImagenNueva(null);
    setForm({
      numeroHabitacion: hab.numeroHabitacion || "",
      precioNoche: hab.precioNoche ?? "",
      estadoHabitacion: hab.estadoHabitacion || "DISPONIBLE",
      descripcion: hab.descripcion || "",
      idTipo: datosTipo(hab).id || "",
    });
  };

  const campo = (nombre) => ({
    value: form[nombre],
    onChange: (e) => setForm((f) => ({ ...f, [nombre]: e.target.value })),
  });

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.numeroHabitacion.trim()) {
      Swal.fire({ title: "Falta el número", text: "El número de habitación es obligatorio.", icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }
    if (!form.precioNoche || Number(form.precioNoche) <= 0) {
      Swal.fire({ title: "Precio inválido", text: "Ingresa un precio por noche mayor a cero.", icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }

    setGuardando(true);
    try {
      await actualizarHabitacion(editando.id, {
        numeroHabitacion: form.numeroHabitacion.trim(),
        datosTipoHabitacion: { id: form.idTipo }, // el backend completa el tipo desde la base de datos
        precioNoche: Number(form.precioNoche),
        estadoHabitacion: form.estadoHabitacion,
        descripcion: form.descripcion.trim() || null,
      });
      if (imagenNueva) await subirImagenHabitacion(editando.id, imagenNueva);
      setEditando(null);
      await Swal.fire({ title: "Habitación actualizada", icon: "success", timer: 1500, showConfirmButton: false });
      cargar(pagina.actual);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message || "No se pudo actualizar.", icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setGuardando(false);
    }
  };

  const quitarImagen = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Quitar la imagen?", text: "La habitación volverá a mostrar la imagen por defecto.",
      icon: "question", showCancelButton: true, confirmButtonText: "Sí, quitar", cancelButtonText: "Volver",
      confirmButtonColor: "#e53e3e",
    });
    if (!isConfirmed) return;
    try {
      const actualizada = await eliminarImagenHabitacion(editando.id);
      setEditando(actualizada);
      setHabitaciones((lista) => lista.map((h) => (h.id === actualizada.id ? actualizada : h)));
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const eliminar = async (hab) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar habitación?",
      html: `<p>La habitación <strong>${escapeHtml(hab.numeroHabitacion)}</strong> se eliminará permanentemente.</p>`,
      icon: "warning", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
      confirmButtonColor: "#e53e3e", cancelButtonColor: "#6c757d",
    });
    if (!isConfirmed) return;

    setEliminandoId(hab.id);
    try {
      await eliminarHabitacion(hab.id);
      await Swal.fire({ title: "Habitación eliminada", icon: "success", timer: 1500, showConfirmButton: false });
      cargar(habitaciones.length === 1 && pagina.actual > 0 ? pagina.actual - 1 : pagina.actual);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message || "No se pudo eliminar.", icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Gestionar <span>habitaciones</span></h1>
          <p className="gb-panel-subtitulo">Precios, estados, descripción e imagen de cada habitación.</p>
        </div>
        <div className="gb-panel-acciones">
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/habitaciones/tipos")}>
            <BsTags /> Tipos
          </button>
          <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/habitaciones/crear")}>
            <BsPlusLg /> Crear habitación
          </button>
        </div>
      </div>

      <div className="gb-tabla-contenedor">
        <table className="gb-tabla">
          <thead>
            <tr>
              <th>Habitación</th>
              <th>Tipo</th>
              <th>Precio / noche</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} className="gb-tabla-vacia"><Spinner size="sm" /> Cargando…</td></tr>
            ) : habitaciones.length === 0 ? (
              <tr><td colSpan={6} className="gb-tabla-vacia">No hay habitaciones registradas.</td></tr>
            ) : habitaciones.map((hab) => {
              const tipo = datosTipo(hab);
              const estado = ESTADOS[hab.estadoHabitacion] || { etiqueta: hab.estadoHabitacion || "—", clase: "gb-estado-finalizada" };
              return (
                <tr key={hab.id}>
                  <td>
                    <div className="gh-habitacion">
                      <img src={imagenHabitacion(hab)} onError={usarImagenDeRespaldoHabitacion} alt="" loading="lazy" />
                      <span className="gb-celda-principal">N.º {hab.numeroHabitacion}</span>
                    </div>
                  </td>
                  <td>{tipo.nombre || "—"}</td>
                  <td className="gb-celda-principal">{pesos(hab.precioNoche)}</td>
                  <td>{tipo.capacidad ? `${tipo.capacidad} personas` : "—"}</td>
                  <td><span className={`gb-estado ${estado.clase}`}>{estado.etiqueta}</span></td>
                  <td>
                    <div className="gb-acciones-fila">
                      <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => abrirEdicion(hab)}>
                        <BsPencil /> Editar
                      </button>
                      <button type="button" className="btn-gb btn-gb-danger btn-gb-sm" onClick={() => eliminar(hab)}
                        disabled={eliminandoId === hab.id} aria-label={`Eliminar habitación ${hab.numeroHabitacion}`}>
                        {eliminandoId === hab.id ? <Spinner size="sm" /> : <BsTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Paginador pagina={pagina.actual} totalPaginas={pagina.total} totalElementos={pagina.elementos}
        etiqueta="habitaciones" onCambiar={cargar} />

      <Modal show={Boolean(editando)} onHide={() => !guardando && setEditando(null)} centered size="lg">
        <Form onSubmit={guardar} className="gb-form">
          <Modal.Header closeButton>
            <Modal.Title>Editar habitación <span className="gh-resaltado">{editando?.numeroHabitacion}</span></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col md={7}>
                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Label htmlFor="gh-numero">Número *</Form.Label>
                    <Form.Control id="gh-numero" maxLength={10} {...campo("numeroHabitacion")} />
                  </Col>
                  <Col sm={6}>
                    <Form.Label htmlFor="gh-tipo">Tipo *</Form.Label>
                    <Form.Select id="gh-tipo" {...campo("idTipo")}>
                      {!form.idTipo && <option value="">Selecciona un tipo…</option>}
                      {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombreTipoHabitacion}</option>)}
                    </Form.Select>
                  </Col>
                  <Col sm={6}>
                    <Form.Label htmlFor="gh-precio">Precio por noche (COP) *</Form.Label>
                    <Form.Control id="gh-precio" type="number" min={1} step={1} inputMode="numeric" {...campo("precioNoche")} />
                  </Col>
                  <Col sm={6}>
                    <Form.Label htmlFor="gh-estado">Estado</Form.Label>
                    <Form.Select id="gh-estado" {...campo("estadoHabitacion")}>
                      {Object.entries(ESTADOS).map(([valor, e]) => <option key={valor} value={valor}>{e.etiqueta}</option>)}
                    </Form.Select>
                  </Col>
                  <Col xs={12}>
                    <Form.Label htmlFor="gh-desc">Descripción</Form.Label>
                    <Form.Control id="gh-desc" as="textarea" rows={4} maxLength={500} {...campo("descripcion")} />
                  </Col>
                </Row>
              </Col>
              <Col md={5}>
                <Form.Label>Imagen</Form.Label>
                <SelectorImagen
                  key={editando?.id}
                  imagenActual={editando?.imagenUrl ? imagenHabitacion(editando) : null}
                  onCambio={setImagenNueva}
                  onQuitar={quitarImagen}
                  deshabilitado={guardando}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn-gb btn-gb-secondary" onClick={() => setEditando(null)} disabled={guardando}>Cancelar</button>
            <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
              {guardando ? <><Spinner size="sm" /> Guardando…</> : "Guardar cambios"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
