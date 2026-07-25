import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Button } from "react-bootstrap";
import { obtenerMisMensajes, marcarRespuestaVista } from "../api/ContactoApi";
import "../styles/MisMensajes.css";

export default function MisMensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const cargar = async (paginaSolicitada = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerMisMensajes(paginaSolicitada, 10);
      setMensajes(data.contenido || []);
      setPagina(data.paginaActual ?? 0);
      setTotalPaginas(data.totalPaginas ?? 0);
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus mensajes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(0);
  }, []);

  const handleVerRespuesta = async (m) => {
    if (m.respuesta && !m.respuestaVista) {
      try {
        const actualizado = await marcarRespuestaVista(m.id);
        setMensajes((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...actualizado } : x)));
      } catch {
        // Manejo silencioso si falla
      }
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
      <Spinner animation="border" style={{ color: "#f38d1e" }} />
    </div>
  );

  return (
    <Container className="py-4 mis-mensajes-page">
      <Row className="mb-4">
        <Col>
          <h2 className="mis-mensajes-titulo">
            MIS <span className="accent">MENSAJES</span>
          </h2>
        </Col>
      </Row>

      {error && <p className="text-danger">{error}</p>}

      {mensajes.length === 0 ? (
        <div className="text-center py-5 card-vacia">
          <p className="text-muted m-0">Aún no has enviado ningún mensaje de contacto.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {mensajes.map((m) => (
            <Card key={m.id} className="mensaje-enviado-card" onClick={() => handleVerRespuesta(m)}>
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span className="mensaje-fecha">
                    {m.fechaEnvio ? new Date(m.fechaEnvio).toLocaleString("es-CO") : ""}
                  </span>
                  {m.respuesta && !m.respuestaVista && (
                    <Badge className="badge-nueva-respuesta">Nueva respuesta</Badge>
                  )}
                </div>

                <div className="tu-mensaje">
                  <span className="etiqueta">Tu mensaje</span>
                  <p className="contenido-texto mb-0">{m.contenido}</p>
                </div>

                {m.respuesta ? (
                  <div className="respuesta-admin">
                    <span className="etiqueta">Respuesta de Golden Booking</span>
                    <p className="mb-2 text-dark">{m.respuesta}</p>
                    {m.fechaRespuesta && (
                      <span className="mensaje-fecha">
                        {new Date(m.fechaRespuesta).toLocaleString("es-CO")}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="pendiente-respuesta">
                    Aún no hemos respondido este mensaje. Te avisaremos apenas lo hagamos.
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4 mis-mensajes-paginacion align-items-center">
          <Button variant="outline-secondary" size="sm" disabled={pagina === 0} onClick={() => cargar(pagina - 1)}>
            ← Anterior
          </Button>
          <span className="small text-muted fw-semibold px-2">
            Página {pagina + 1} de {totalPaginas}
          </span>
          <Button variant="outline-secondary" size="sm" disabled={pagina + 1 >= totalPaginas} onClick={() => cargar(pagina + 1)}>
            Siguiente →
          </Button>
        </div>
      )}
    </Container>
  );
}