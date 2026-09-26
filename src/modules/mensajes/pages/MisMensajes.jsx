import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Spinner } from "react-bootstrap";
import { BsPencilSquare } from "react-icons/bs";
import { obtenerMisMensajes, marcarRespuestaVista } from "../api/ContactoApi";
import Paginador from "../../../shared/components/reservas/Paginador";
import { fechaHora } from "../../../shared/utils/formato";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/Mensajes.css";

/** Mensajes que el cliente envió desde Contáctanos y las respuestas de la administración. */
export default function MisMensajes() {
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const cargar = useCallback(async (numero = 0) => {
    setCargando(true);
    setError("");
    try {
      const datos = await obtenerMisMensajes(numero, 10);
      setMensajes(datos.contenido || []);
      setPagina(datos.paginaActual ?? 0);
      setTotalPaginas(datos.totalPaginas ?? 0);
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus mensajes.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(0); }, [cargar]);

  // Al abrir un mensaje con respuesta nueva, se marca como vista
  const verRespuesta = async (m) => {
    if (!m.respuesta || m.respuestaVista) return;
    try {
      const actualizado = await marcarRespuestaVista(m.id);
      setMensajes((lista) => lista.map((x) => (x.id === m.id ? { ...x, ...actualizado } : x)));
    } catch {
      // no es crítico: se volverá a marcar la próxima vez
    }
  };

  return (
    <div className="gb-panel mensajes-page">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Mis <span>mensajes</span></h1>
          <p className="gb-panel-subtitulo">Lo que nos escribiste y nuestras respuestas.</p>
        </div>
        <div className="gb-panel-acciones">
          <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/contactos")}>
            <BsPencilSquare /> Escribir mensaje
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <div className="text-center py-5"><Spinner style={{ color: "var(--gb-primary)" }} /></div>
      ) : mensajes.length === 0 ? (
        <div className="gb-vacio"><p className="m-0">Aún no nos has enviado ningún mensaje.</p></div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {mensajes.map((m) => (
            <Card key={m.id} className="mensaje-card mensaje-enviado-card" onClick={() => verRespuesta(m)}>
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span className="mensaje-fecha">{fechaHora(m.fechaEnvio)}</span>
                  {m.respuesta && !m.respuestaVista && <Badge className="badge-nueva-respuesta">Nueva respuesta</Badge>}
                </div>

                <div className="tu-mensaje">
                  <span className="etiqueta">Tu mensaje</span>
                  <p className="contenido-texto mb-0">{m.contenido}</p>
                </div>

                {m.respuesta ? (
                  <div className="respuesta-admin">
                    <span className="etiqueta">Respuesta de Golden Booking</span>
                    <p className="mb-2">{m.respuesta}</p>
                    {m.fechaRespuesta && <span className="mensaje-fecha">{fechaHora(m.fechaRespuesta)}</span>}
                  </div>
                ) : (
                  <div className="pendiente-respuesta">Aún no hemos respondido este mensaje. Te avisaremos por correo apenas lo hagamos.</div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      <Paginador pagina={pagina} totalPaginas={totalPaginas} etiqueta="mensajes" onCambiar={cargar} />
    </div>
  );
}
