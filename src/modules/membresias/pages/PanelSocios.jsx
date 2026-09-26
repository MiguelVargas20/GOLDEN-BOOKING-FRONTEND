import { useCallback, useEffect, useState } from "react";
import { Form, Row, Col, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsAward, BsLightningCharge, BsSearch, BsGear } from "react-icons/bs";
import { obtenerConfigMembresia, guardarConfigMembresia, listarSocios, asignarMembresia } from "../api/MembresiaApi";
import { NOMBRE_MEMBRESIA } from "../hooks/useMiMembresia";
import { fecha } from "../../../shared/utils/formato";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../../../shared/styles/Catalogo.css";
import "../styles/Membresias.css";

const FILTROS = {
  TODOS: "Todos",
  SUGERIDOS: "Sugeridos",
  OCASIONAL: "Ocasionales",
  MIEMBRO: "Miembros",
  NINGUNA: "Sin membresía",
};

/**
 * Panel de miembros / socios (ADMIN): define a partir de cuántas reservas se
 * sugiere hacer socio a un cliente y qué beneficios tiene cada categoría
 * (Ocasional y Miembro), y asigna la categoría a cada cliente.
 */
export default function PanelSocios() {
  const [config, setConfig] = useState(null);
  const [socios, setSocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const cargarSocios = useCallback(() => listarSocios().then(setSocios), []);

  useEffect(() => {
    Promise.all([obtenerConfigMembresia().then(setConfig), cargarSocios()])
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [cargarSocios]);

  const cambiar = (campo, valor) => setConfig({ ...config, [campo]: valor });
  const cambiarBeneficio = (tipo, campo, valor) => setConfig({ ...config, [tipo]: { ...config[tipo], [campo]: valor } });

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const num = (v) => Number(v) || 0;
      const guardada = await guardarConfigMembresia({
        reservasParaSugerir: num(config.reservasParaSugerir),
        diasAnticipacionGeneral: num(config.diasAnticipacionGeneral),
        ocasional: { ...config.ocasional, descuento: num(config.ocasional.descuento), diasAnticipacion: num(config.ocasional.diasAnticipacion) },
        miembro: { ...config.miembro, descuento: num(config.miembro.descuento), diasAnticipacion: num(config.miembro.diasAnticipacion) },
      });
      setConfig(guardada);
      await cargarSocios();
      Swal.fire({ title: "Configuración guardada", icon: "success", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: "No se pudo guardar", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setGuardando(false);
    }
  };

  const asignar = async (socio, tipo) => {
    if (tipo === socio.membresia) return;
    const { isConfirmed } = await Swal.fire({
      title: tipo === "NINGUNA" ? "¿Quitar la membresía?" : `¿Hacer ${NOMBRE_MEMBRESIA[tipo]}?`,
      text: `${socio.nombre} · ${socio.reservas} reservas`,
      icon: "question", showCancelButton: true, confirmButtonText: "Sí, cambiar", cancelButtonText: "Volver", confirmButtonColor: "#f38d1e",
    });
    if (!isConfirmed) return;
    try {
      await asignarMembresia(socio.idUsuario, tipo);
      await cargarSocios();
      Swal.fire({ title: "Membresía actualizada", text: "Se le avisó al cliente por la campana.", icon: "success", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const texto = busqueda.trim().toLowerCase();
  const visibles = socios.filter((s) => {
    if (filtro === "SUGERIDOS" && !s.sugerido) return false;
    if (["OCASIONAL", "MIEMBRO", "NINGUNA"].includes(filtro) && s.membresia !== filtro) return false;
    return !texto || s.nombre.toLowerCase().includes(texto) || (s.documento || "").includes(texto);
  });
  const conteo = (f) => (f === "TODOS" ? socios.length : f === "SUGERIDOS" ? socios.filter((s) => s.sugerido).length : socios.filter((s) => s.membresia === f).length);

  if (cargando) return <div className="gb-panel text-center py-5"><Spinner /></div>;

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Miembros y <span>socios</span></h1>
          <p className="gb-panel-subtitulo">Premia a los clientes frecuentes: cuando superan el número de reservas que definas aparecen como sugeridos.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {config && (
        <Form className="gb-tarjeta gb-form mb-4" onSubmit={guardar}>
          <h2 className="gb-seccion-titulo"><BsGear /> Reglas del programa</h2>
          <Row className="g-3">
            <Col sm={6} lg={3}>
              <Form.Label htmlFor="so-sugerir">Sugerir socio desde</Form.Label>
              <div className="so-sufijo">
                <Form.Control id="so-sugerir" type="number" min={1} max={500} required
                  value={config.reservasParaSugerir} onChange={(e) => cambiar("reservasParaSugerir", e.target.value)} />
                <span>reservas</span>
              </div>
            </Col>
            <Col sm={6} lg={3}>
              <Form.Label htmlFor="so-dias-general">Anticipación sin membresía</Form.Label>
              <div className="so-sufijo">
                <Form.Control id="so-dias-general" type="number" min={1} max={730} required
                  value={config.diasAnticipacionGeneral} onChange={(e) => cambiar("diasAnticipacionGeneral", e.target.value)} />
                <span>días</span>
              </div>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            {["ocasional", "miembro"].map((tipo) => (
              <Col md={6} key={tipo}>
                <div className={`so-categoria so-${tipo}`}>
                  <h3><BsAward /> {tipo === "ocasional" ? "Socio Ocasional" : "Socio Miembro"}</h3>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Label htmlFor={`so-${tipo}-descuento`}>Descuento</Form.Label>
                      <div className="so-sufijo">
                        <Form.Control id={`so-${tipo}-descuento`} type="number" min={0} max={50} step={0.5} required
                          value={config[tipo].descuento} onChange={(e) => cambiarBeneficio(tipo, "descuento", e.target.value)} />
                        <span>%</span>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <Form.Label htmlFor={`so-${tipo}-dias`}>Reserva anticipada</Form.Label>
                      <div className="so-sufijo">
                        <Form.Control id={`so-${tipo}-dias`} type="number" min={1} max={730} required
                          value={config[tipo].diasAnticipacion} onChange={(e) => cambiarBeneficio(tipo, "diasAnticipacion", e.target.value)} />
                        <span>días</span>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <Form.Label htmlFor={`so-${tipo}-otros`}>Otros beneficios</Form.Label>
                      <Form.Control id={`so-${tipo}-otros`} as="textarea" rows={2} maxLength={300}
                        value={config[tipo].otrosBeneficios || ""} onChange={(e) => cambiarBeneficio(tipo, "otrosBeneficios", e.target.value)} />
                    </Col>
                  </Row>
                </div>
              </Col>
            ))}
          </Row>
          <div className="d-flex justify-content-end mt-3">
            <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
              {guardando ? <Spinner size="sm" /> : null} Guardar reglas
            </button>
          </div>
        </Form>
      )}

      <div className="gb-tarjeta">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 className="gb-seccion-titulo m-0">Clientes</h2>
          <div className="so-buscar">
            <BsSearch aria-hidden="true" />
            <Form.Control id="so-buscar" placeholder="Nombre o documento" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar cliente" />
          </div>
        </div>
        <div className="gb-chips" role="group" aria-label="Filtrar clientes">
          {Object.entries(FILTROS).map(([f, t]) => (
            <button key={f} type="button" className={`gb-chip ${filtro === f ? "activo" : ""}`} aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
              {t} <span>{conteo(f)}</span>
            </button>
          ))}
        </div>

        {visibles.length === 0 ? (
          <p className="gb-ayuda m-0">No hay clientes con este filtro.</p>
        ) : (
          <div className="gb-tabla-contenedor">
            <table className="gb-tabla">
              <thead>
                <tr><th>Cliente</th><th>Reservas</th><th>Categoría</th><th>Cambiar a</th></tr>
              </thead>
              <tbody>
                {visibles.map((s) => (
                  <tr key={s.idUsuario}>
                    <td>
                      <span className="gb-celda-principal">{s.nombre}</span>
                      <span className="gb-celda-secundaria">Doc. {s.documento || "—"} · {s.email}</span>
                    </td>
                    <td>
                      <strong>{s.reservas}</strong>
                      {s.sugerido && <span className="so-sugerido"><BsLightningCharge /> Sugerido</span>}
                    </td>
                    <td>
                      <span className={`so-badge so-badge-${s.membresia.toLowerCase()}`}>{NOMBRE_MEMBRESIA[s.membresia]}</span>
                      {s.fechaMembresia && s.membresia !== "NINGUNA" && <span className="gb-celda-secundaria">desde {fecha(s.fechaMembresia)}</span>}
                    </td>
                    <td>
                      <div className="gb-acciones-fila">
                        {["OCASIONAL", "MIEMBRO", "NINGUNA"].filter((t) => t !== s.membresia).map((t) => (
                          <button key={t} type="button" className={`btn-gb btn-gb-sm ${t === "NINGUNA" ? "btn-gb-secondary" : "btn-gb-primary"}`}
                            onClick={() => asignar(s, t)}>
                            {t === "OCASIONAL" ? "Ocasional" : t === "MIEMBRO" ? "Miembro" : "Quitar"}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
