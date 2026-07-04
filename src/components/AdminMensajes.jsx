import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { listarMensajes, marcarMensajeLeido } from "../api/ContactoApi";

export default function AdminMensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🆕 estado de paginación, ya que el backend SÍ pagina (totalPaginas, etc.)
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  // 🆕 filtro simple para ver solo los no leídos si el admin quiere
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);

  const cargarMensajes = async (paginaSolicitada = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await listarMensajes(paginaSolicitada, 10);
      // ⚠️ El backend devuelve "contenido", NO "content" (MensajeController
      // arma el Map con esa clave en español) — este era el bug silencioso.
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

  const handleMarcarLeido = async (id) => {
    try {
      const actualizado = await marcarMensajeLeido(id);
      // 🆕 Actualizamos el mensaje EN el arreglo (no lo quitamos), para que
      // la bandeja siga mostrando el historial completo. Solo cambia su
      // estado visual (deja de tener el badge "Nuevo" y el botón de acción).
      setMensajes((prev) =>
        prev.map((m) => (m.id === id ? { ...m, leido: actualizado.leido } : m))
      );
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message || "No se pudo actualizar el estado.", icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const mensajesFiltrados = soloNoLeidos ? mensajes.filter((m) => !m.leido) : mensajes;

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
      <Spinner animation="border" style={{ color: "#f38d1e" }} />
    </div>
  );

  return (
    <Container className="py-4" style={{ maxWidth: "800px" }}>
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold m-0">Bandeja de Mensajes</h2>
        </Col>
        <Col xs="auto">
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
          {soloNoLeidos ? "No tienes mensajes sin leer." : "No hay mensajes registrados."}
        </p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {mensajesFiltrados.map((m) => (
            <Card key={m.id} className={m.leido ? "" : "border-warning"}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{m.nombre}</strong>{" "}
                    <span className="text-muted small">({m.correo})</span>
                  </div>
                  {!m.leido && <Badge bg="danger">Nuevo</Badge>}
                </div>

                <p className="mb-2">{m.contenido}</p>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    {m.fechaEnvio ? new Date(m.fechaEnvio).toLocaleString("es-CO") : ""}
                  </span>

                  {!m.leido && (
                    <Button
                      size="sm"
                      style={{ backgroundColor: "#f38d1e", borderColor: "#f38d1e" }}
                      onClick={() => handleMarcarLeido(m.id)}
                    >
                      Marcar como leído
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* 🆕 Paginación básica */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4">
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