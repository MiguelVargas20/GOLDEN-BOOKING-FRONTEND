import { useCallback, useEffect, useState } from "react";
import { Modal, Form, Row, Col, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsPlusLg, BsPencil, BsTrash, BsCalendarEvent, BsGeoAlt, BsPeople } from "react-icons/bs";
import {
  listarEventos, crearEvento, actualizarEvento, eliminarEvento, subirImagenEvento, eliminarImagenEvento,
} from "../api/EventoApi";
import { CATEGORIAS_EVENTO, imagenEvento } from "../utils";
import CampoFecha from "../../../shared/components/fechas/CampoFecha";
import SelectorImagen from "../../../shared/components/SelectorImagen";
import { fechaHora, pesos } from "../../../shared/utils/formato";
import { aTextoFecha } from "../../../shared/utils/fechas";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../../../shared/styles/Catalogo.css";
import "../styles/Eventos.css";

const FORM_VACIO = {
  titulo: "", categoria: "BAILE", descripcion: "", lugar: "",
  diaInicio: "", horaInicio: "19:00", diaFin: "", horaFin: "23:00",
  cupo: "", precio: "", publicado: true,
};

/** "2026-10-17T19:00:00" → { dia: "2026-10-17", hora: "19:00" } */
const partir = (valor) => ({ dia: valor.slice(0, 10), hora: valor.slice(11, 16) });

/**
 * Eventos del club (ADMIN): noches de baile, actividades recreativas,
 * festivales... Al publicarlos aparecen en la portada del cliente y se
 * le avisa por la campana.
 */
export default function GestionEventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setEventos(await listarEventos());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setArchivo(null);
    setMostrarModal(true);
  };

  const abrirEditar = (ev) => {
    const ini = partir(ev.fechaInicio);
    const fin = partir(ev.fechaFin);
    setEditando(ev);
    setForm({
      titulo: ev.titulo, categoria: ev.categoria, descripcion: ev.descripcion || "", lugar: ev.lugar,
      diaInicio: ini.dia, horaInicio: ini.hora, diaFin: fin.dia, horaFin: fin.hora,
      cupo: ev.cupo ?? "", precio: ev.precio ?? "", publicado: ev.publicado,
    });
    setArchivo(null);
    setMostrarModal(true);
  };

  const campo = (nombre) => ({ value: form[nombre], onChange: (e) => setForm({ ...form, [nombre]: e.target.value }) });

  const guardar = async (e) => {
    e.preventDefault();
    const diaFin = form.diaFin || form.diaInicio;
    if (!form.diaInicio) return aviso("Elige el día en que empieza el evento.");
    const fechaInicio = `${form.diaInicio}T${form.horaInicio}:00`;
    const fechaFin = `${diaFin}T${form.horaFin}:00`;
    if (fechaFin <= fechaInicio) return aviso("La hora de fin debe ser posterior a la de inicio.");

    const datos = {
      titulo: form.titulo.trim(), categoria: form.categoria, descripcion: form.descripcion.trim() || null,
      lugar: form.lugar.trim(), fechaInicio, fechaFin, publicado: form.publicado,
      cupo: form.cupo === "" ? null : Number(form.cupo),
      precio: form.precio === "" ? null : Number(form.precio),
    };

    setGuardando(true);
    try {
      const guardado = editando ? await actualizarEvento(editando.id, datos) : await crearEvento(datos);
      if (archivo) {
        try {
          await subirImagenEvento(guardado.id, archivo);
        } catch (err) {
          await Swal.fire({ title: "Evento guardado sin imagen", text: err.message, icon: "warning", confirmButtonColor: "#f38d1e" });
        }
      }
      setMostrarModal(false);
      await cargar();
      Swal.fire({
        title: editando ? "Evento actualizado" : "Evento creado",
        text: datos.publicado ? "Los clientes ya lo ven en la portada." : "Quedó como borrador: los clientes no lo ven.",
        icon: "success", timer: 1800, showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ title: "No se pudo guardar", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setGuardando(false);
    }
  };

  const aviso = (texto) => Swal.fire({ title: "Revisa las fechas", text: texto, icon: "warning", confirmButtonColor: "#f38d1e" });

  const quitarImagen = async () => {
    try {
      const actualizado = await eliminarImagenEvento(editando.id);
      setEditando(actualizado);
      cargar();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const eliminar = async (ev) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar el evento?", html: `<strong>${escapeHtml(ev.titulo)}</strong><br>Los clientes dejarán de verlo.`,
      icon: "warning", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Volver", confirmButtonColor: "#e53e3e",
    });
    if (!isConfirmed) return;
    try {
      await eliminarEvento(ev.id);
      cargar();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const hoy = aTextoFecha(new Date());
  const ahora = new Date();
  const terminado = (ev) => new Date(ev.fechaFin) < ahora;

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Eventos del <span>club</span></h1>
          <p className="gb-panel-subtitulo">Crea noches de baile, actividades recreativas, festivales y más. Los publicados aparecen en la portada del cliente.</p>
        </div>
        <button type="button" className="btn-gb btn-gb-primary" onClick={abrirNuevo}>
          <BsPlusLg /> Nuevo evento
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : eventos.length === 0 ? (
        <div className="gb-tarjeta text-center py-5">
          <BsCalendarEvent size={36} className="mb-2 ev-icono-vacio" />
          <p className="gb-ayuda">Aún no hay eventos. Crea el primero con “Nuevo evento”.</p>
        </div>
      ) : (
        <div className="ev-admin-grid">
          {eventos.map((ev) => (
            <article key={ev.id} className={`gb-tarjeta ev-admin-card ${terminado(ev) ? "ev-terminado" : ""}`}>
              <div className="ev-admin-imagen">
                <img src={imagenEvento(ev)} alt="" />
                <span className="ev-categoria">{CATEGORIAS_EVENTO[ev.categoria]}</span>
                {!ev.publicado && <span className="ev-borrador">Borrador</span>}
                {ev.publicado && terminado(ev) && <span className="ev-borrador">Finalizado</span>}
              </div>
              <div className="ev-admin-cuerpo">
                <h2 className="ev-titulo">{ev.titulo}</h2>
                <p className="ev-dato"><BsCalendarEvent /> {fechaHora(ev.fechaInicio)}</p>
                <p className="ev-dato"><BsGeoAlt /> {ev.lugar}</p>
                <p className="ev-dato"><BsPeople /> {ev.cupo ? `${ev.cupo} cupos` : "Sin límite de cupos"} · {ev.precio ? pesos(ev.precio) : "Gratis"}</p>
              </div>
              <div className="ev-admin-acciones">
                <button type="button" className="btn-gb btn-gb-secondary btn-gb-sm" onClick={() => abrirEditar(ev)}>
                  <BsPencil /> Editar
                </button>
                <button type="button" className="btn-gb btn-gb-danger btn-gb-sm" onClick={() => eliminar(ev)} aria-label={`Eliminar ${ev.titulo}`}>
                  <BsTrash />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal show={mostrarModal} onHide={() => !guardando && setMostrarModal(false)} size="lg" centered>
        <Form onSubmit={guardar} className="gb-form">
          <Modal.Header closeButton={!guardando}>
            <Modal.Title>{editando ? "Editar evento" : "Nuevo evento"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={5}>
                <SelectorImagen
                  key={editando?.id || "nuevo"}
                  imagenActual={editando?.imagenUrl ? imagenEvento(editando) : null}
                  onCambio={setArchivo}
                  onQuitar={editando?.imagenUrl ? quitarImagen : undefined}
                  deshabilitado={guardando}
                />
                <Form.Check type="switch" id="ev-publicado" className="mt-3" label="Publicado (visible para los clientes)"
                  checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} />
              </Col>
              <Col md={7}>
                <Row className="g-2">
                  <Col xs={12}>
                    <Form.Label htmlFor="ev-titulo">Título *</Form.Label>
                    <Form.Control id="ev-titulo" required minLength={3} maxLength={80} placeholder="Ej.: Noche de salsa" {...campo("titulo")} />
                  </Col>
                  <Col sm={6}>
                    <Form.Label htmlFor="ev-categoria">Categoría</Form.Label>
                    <Form.Select id="ev-categoria" {...campo("categoria")}>
                      {Object.entries(CATEGORIAS_EVENTO).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </Form.Select>
                  </Col>
                  <Col sm={6}>
                    <Form.Label htmlFor="ev-lugar">Lugar *</Form.Label>
                    <Form.Control id="ev-lugar" required maxLength={80} placeholder="Ej.: Salón principal" {...campo("lugar")} />
                  </Col>
                  <Col xs={7}>
                    <Form.Label htmlFor="ev-dia-inicio">Empieza *</Form.Label>
                    <CampoFecha id="ev-dia-inicio" valor={form.diaInicio} min={editando ? undefined : hoy}
                      onCambio={(d) => setForm({ ...form, diaInicio: d, diaFin: form.diaFin && form.diaFin >= d ? form.diaFin : d })} />
                  </Col>
                  <Col xs={5}>
                    <Form.Label htmlFor="ev-hora-inicio">Hora</Form.Label>
                    <Form.Control id="ev-hora-inicio" type="time" required {...campo("horaInicio")} />
                  </Col>
                  <Col xs={7}>
                    <Form.Label htmlFor="ev-dia-fin">Termina</Form.Label>
                    <CampoFecha id="ev-dia-fin" valor={form.diaFin} min={form.diaInicio || hoy} placeholder="El mismo día"
                      onCambio={(d) => setForm({ ...form, diaFin: d })} />
                  </Col>
                  <Col xs={5}>
                    <Form.Label htmlFor="ev-hora-fin">Hora</Form.Label>
                    <Form.Control id="ev-hora-fin" type="time" required {...campo("horaFin")} />
                  </Col>
                  <Col xs={6}>
                    <Form.Label htmlFor="ev-cupo">Cupos</Form.Label>
                    <Form.Control id="ev-cupo" type="number" min={1} placeholder="Sin límite" {...campo("cupo")} />
                  </Col>
                  <Col xs={6}>
                    <Form.Label htmlFor="ev-precio">Entrada ($)</Form.Label>
                    <Form.Control id="ev-precio" type="number" min={0} step={1} placeholder="Gratis" {...campo("precio")} />
                  </Col>
                  <Col xs={12}>
                    <Form.Label htmlFor="ev-descripcion">Descripción</Form.Label>
                    <Form.Control id="ev-descripcion" as="textarea" rows={3} maxLength={1000}
                      placeholder="Qué habrá, horarios, qué llevar..." {...campo("descripcion")} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn-gb btn-gb-secondary" onClick={() => setMostrarModal(false)} disabled={guardando}>Cancelar</button>
            <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
              {guardando ? <><Spinner size="sm" className="me-2" />Guardando...</> : editando ? "Guardar cambios" : "Crear evento"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
