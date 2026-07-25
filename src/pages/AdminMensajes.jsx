import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { listarMensajes, marcarMensajeLeido, responderMensaje } from "../api/ContactoApi";
import "../styles/AdminMensajes.css";

export default function AdminMensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [soloNoLeidos, setSoloNoLeidos] = useState(false);

  // 🆕 buscador por nombre
  const [busqueda, setBusqueda] = useState("");

  // 🆕 qué mensaje tiene la caja de "responder" abierta, y el texto que se está escribiendo
  const [respondiendoId, setRespondiendoId] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);

  const cargarMensajes = async (paginaSolicitada = 0, terminoBusqueda = busqueda) => {
    setLoading(true);
    setError("");
    try {
      // listarMensajes ya acepta "nombre" como filtro opcional (si viene vacío, trae todo)
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
  };

  useEffect(() => {
    cargarMensajes(0);
  }, []);

  // 🆕 Debounce del buscador: espera 400ms sin que el admin escriba antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarMensajes(0, busqueda);
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

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

  // 🆕 Abre/cierra la caja de responder para un mensaje puntual
  const toggleResponder = (id) => {
    if (respondiendoId === id) {
      setRespondiendoId(null);
      setTextoRespuesta("");
    } else {
      setRespondiendoId(id);
      setTextoRespuesta("");
    }
  };

  // 🆕 Envía la respuesta (el backend se encarga de mandar el correo al usuario)
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
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
      <Spinner animation="border" style={{ color: "#f38d1e" }} />
    </div>
  );

  return (
    <Container className="py-4 mensajes-page">
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="mensajes-titulo">
            BANDEJA DE <span className="accent">MENSAJES</span>
          </h2>
        </Col>
      </Row>

      <Row className="align-items-center mb-4 mensajes-toolbar">
        <Col xs={12} md="auto">
          <Form.Control
            className="mensajes-buscador"
            placeholder="Buscar por nombre de usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Col>
        <Col xs="auto" className="ms-md-auto">
          <Form.Check
            type="switch"
            id="filtro-no-leidos"
            label="Solo no leídos"
            checked={soloNoLeidos}
            onChange={(e) => setSoloNoLeidos(e.target.checked)}
          />
        </Col>
      </Row>

      {error && <p className="text-danger">{error}</p>}

      {mensajesFiltrados.length === 0 ? (
        <p className="text-muted">
          {busqueda.trim()
            ? "No hay mensajes de ese usuario."
            : soloNoLeidos
            ? "No tienes mensajes sin leer."
            : "No hay mensajes registrados."}
        </p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {mensajesFiltrados.map((m) => (
            <Card key={m.id} className={`mensaje-card ${m.leido ? "" : "no-leido"}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="mensaje-remitente">{m.nombre}</span>{" "}
                    <span className="mensaje-correo">({m.correo})</span>
                  </div>
                  <div className="d-flex gap-2">
                    {!m.leido && <Badge className="badge-nuevo">Nuevo</Badge>}
                    {m.respuesta && <Badge className="badge-respondido">Respondido</Badge>}
                  </div>
                </div>

                <p className="mb-2">{m.contenido}</p>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="mensaje-fecha">
                    {m.fechaEnvio ? new Date(m.fechaEnvio).toLocaleString("es-CO") : ""}
                  </span>

                  <div className="d-flex gap-2">
                    {!m.leido && (
                      <Button className="btn-mensaje-secundario" size="sm" onClick={() => handleMarcarLeido(m.id)}>
                        Marcar como leído
                      </Button>
                    )}
                    {!m.respuesta && (
                      <Button
                        className="btn-mensaje-primario"
                        size="sm"
                        onClick={() => toggleResponder(m.id)}
                      >
                        {respondiendoId === m.id ? "Cancelar" : "Responder"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* 🆕 Caja para escribir la respuesta, se abre solo para el mensaje activo */}
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
                        className="btn-mensaje-primario"
                        size="sm"
                        disabled={enviandoRespuesta}
                        onClick={() => handleEnviarRespuesta(m.id)}
                      >
                        {enviandoRespuesta ? "Enviando..." : "Enviar respuesta"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 🆕 Respuesta ya enviada, se muestra debajo del mensaje original */}
                {m.respuesta && (
                  <div className="respuesta-enviada">
                    <div className="etiqueta">Tu respuesta</div>
                    <p className="mb-1">{m.respuesta}</p>
                    {m.fechaRespuesta && (
                      <span className="mensaje-fecha">
                        {new Date(m.fechaRespuesta).toLocaleString("es-CO")}
                      </span>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4 mensajes-paginacion">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pagina === 0}
            onClick={() => cargarMensajes(pagina - 1)}
          >
            ← Anterior
          </Button>
          <span className="align-self-center small text-muted">
            Página {pagina + 1} de {totalPaginas}
          </span>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pagina + 1 >= totalPaginas}
            onClick={() => cargarMensajes(pagina + 1)}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </Container>
  );
}