import { useCallback, useEffect, useState } from "react";
import { Card, Button, Spinner, Badge, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { listarMensajes, marcarMensajeLeido, responderMensaje } from "../api/ContactoApi";
import Paginador from "../../../shared/components/reservas/Paginador";
import { fechaHora } from "../../../shared/utils/formato";
import "../../../shared/styles/PanelAdmin.css";
import "../styles/Mensajes.css";
import "../../../shared/styles/BotonesCompartidos.css";

export default function AdminMensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [soloNoLeidos, setSoloNoLeidos] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [respondiendoId, setRespondiendoId] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);

  // El término se pasa siempre explícito: así la función no depende del estado
  // y los efectos no tienen dependencias ocultas.
  const cargarMensajes = useCallback(async (paginaSolicitada, terminoBusqueda) => {
    setLoading(true);
    setError("");
    try {
      const data = await listarMensajes(paginaSolicitada, 10, terminoBusqueda);
      setMensajes(data.contenido || []);
      setPagina(data.paginaActual ?? 0);
      setTotalPaginas(data.totalPaginas ?? 0);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar los mensajes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Una sola carga: al entrar (sin espera) y al escribir en el buscador (con
  // 400 ms de espera). Antes había dos efectos y al abrir la página se pedían
  // los mensajes dos veces.
  useEffect(() => {
    const timer = setTimeout(() => cargarMensajes(0, busqueda), busqueda ? 400 : 0);
    return () => clearTimeout(timer);
  }, [busqueda, cargarMensajes]);

  const handleMarcarLeido = async (id) => {
    try {
      const actualizado = await marcarMensajeLeido(id);
      setMensajes((prev) =>
        prev.map((m) => (m.id === id ? { ...m, leido: actualizado.leido } : m))
      );
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message || "No se pudo actualizar el estado.", icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const toggleResponder = (id) => {
    if (respondiendoId === id) {
      setRespondiendoId(null);
      setTextoRespuesta("");
    } else {
      setRespondiendoId(id);
      setTextoRespuesta("");
    }
  };

  const handleEnviarRespuesta = async (id) => {
    if (!textoRespuesta.trim()) {
      Swal.fire({ title: "Escribe algo primero", icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }
    setEnviandoRespuesta(true);
    try {
      const actualizado = await responderMensaje(id, textoRespuesta.trim());
      setMensajes((prev) => prev.map((m) => (m.id === id ? { ...m, ...actualizado } : m)));
      setRespondiendoId(null);
      setTextoRespuesta("");
      Swal.fire({
        title: "Respuesta enviada",
        text: "Se le notificó al usuario por correo.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ title: "No se pudo enviar", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const mensajesFiltrados = soloNoLeidos ? mensajes.filter((m) => !m.leido) : mensajes;

  if (loading) return (
    <div className="gb-panel text-center py-5"><Spinner animation="border" style={{ color: "var(--gb-primary)" }} /></div>
  );

  return (
    <div className="gb-panel mensajes-page">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Bandeja de <span>mensajes</span></h1>
          <p className="gb-panel-subtitulo">Mensajes que llegan desde Contáctanos. Al responder, el usuario recibe un correo.</p>
        </div>
        <div className="gb-panel-acciones">
          <input type="search" className="gb-buscador" placeholder="Buscar por nombre de usuario"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar mensajes" />
          <Form.Check type="switch" id="filtro-no-leidos" label="Solo no leídos" checked={soloNoLeidos}
            onChange={(e) => setSoloNoLeidos(e.target.checked)} className="fw-semibold" />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {mensajesFiltrados.length === 0 ? (
        <div className="gb-vacio">
          <p className="m-0">
            {busqueda.trim()
              ? "No hay mensajes de ese usuario."
              : soloNoLeidos
              ? "No tienes mensajes sin leer."
              : "No hay mensajes registrados."}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {mensajesFiltrados.map((m) => (
            <Card key={m.id} className={`mensaje-card ${m.leido ? "" : "no-leido"}`}>
              <Card.Body className="p-3 p-md-4">
                {/* Encabezado de la Card */}
                <div className="d-flex justify-content-between align-items-start gap-2 mb-3 pb-2 border-bottom">
                  <div>
                    <h5 className="mensaje-remitente mb-0">{m.nombre}</h5>
                    <span className="mensaje-correo">{m.correo}</span>
                  </div>
                  <div className="d-flex gap-2 align-items-center flex-wrap justify-content-end">
                    {!m.leido && <Badge className="badge-nuevo">Nuevo</Badge>}
                    {m.respuesta ? (
                      <Badge className="badge-respondido">Respondido</Badge>
                    ) : (
                      <Badge className="badge-pendiente">Pendiente</Badge>
                    )}
                  </div>
                </div>

                {/* Bloque del mensaje del usuario */}
                <div className="mensaje-contenido-box mb-3">
                  <span className="etiqueta">Mensaje Recibido</span>
                  <p className="contenido-texto">{m.contenido}</p>
                  <span className="mensaje-fecha">
                    {fechaHora(m.fechaEnvio)}
                  </span>
                </div>

                {/* Acciones */}
                <div className="d-flex justify-content-end gap-2 flex-wrap">
                  {!m.leido && (
                    <Button className="btn-gb btn-gb-neutral btn-gb-sm" size="sm" onClick={() => handleMarcarLeido(m.id)}>
                      Marcar como leído
                    </Button>
                  )}
                  {!m.respuesta && (
                    <Button
                      className="btn-gb btn-gb-primary btn-gb-sm"
                      size="sm"
                      onClick={() => toggleResponder(m.id)}
                    >
                      {respondiendoId === m.id ? "Cancelar" : "Responder"}
                    </Button>
                  )}
                </div>

                {/* Formulario de Respuesta */}
                {respondiendoId === m.id && (
                  <div className="caja-responder">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={`Escribe tu respuesta para ${m.nombre}...`}
                      value={textoRespuesta}
                      onChange={(e) => setTextoRespuesta(e.target.value)}
                      disabled={enviandoRespuesta}
                    />
                    <div className="d-flex justify-content-end mt-2">
                      <Button
                        className="btn-gb btn-gb-primary btn-gb-sm"
                        size="sm"
                        disabled={enviandoRespuesta}
                        onClick={() => handleEnviarRespuesta(m.id)}
                      >
                        {enviandoRespuesta ? "Enviando..." : "Enviar respuesta"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Respuesta Enviada */}
                {m.respuesta && (
                  <div className="respuesta-enviada">
                    <div className="etiqueta">Tu respuesta</div>
                    <p className="mb-2">{m.respuesta}</p>
                    {m.fechaRespuesta && (
                      <span className="mensaje-fecha">
                        {fechaHora(m.fechaRespuesta)}
                      </span>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      <Paginador pagina={pagina} totalPaginas={totalPaginas} etiqueta="mensajes"
        onCambiar={(n) => cargarMensajes(n, busqueda)} />
    </div>
  );
}