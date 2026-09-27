import { useCallback, useEffect, useState } from "react";
import { Form, Row, Col, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsSearch, BsPlusLg, BsCheck2Circle, BsTrash, BsReceipt, BsAward } from "react-icons/bs";
import {
  obtenerCuentaCliente, registrarCargo, pagarCargo, pagarPendientesCliente, eliminarCargo, listarCargosPendientes,
} from "../api/CargoApi";
import { CATEGORIAS_CARGO, CONSUMOS_RAPIDOS } from "../utils";
import { NOMBRE_MEMBRESIA } from "../../membresias/hooks/useMiMembresia";
import { fechaHora, pesos } from "../../../shared/utils/formato";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../../../shared/styles/Catalogo.css";
import "../styles/Cargos.css";

const FORM_VACIO = { concepto: "", categoria: "RESTAURANTE", cantidad: 1, valorUnitario: "", destino: "" };

/**
 * Consumos y cuentas (ADMIN): se busca al cliente por su documento, se carga
 * lo que consumió (restaurante, bar, tienda...) a una reserva activa o a su
 * cuenta de socio, y se cobra todo al hacer el check-out o a fin de mes.
 */
export default function GestionCargos() {
  const [documento, setDocumento] = useState("");
  const [cuenta, setCuenta] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [pendientes, setPendientes] = useState([]);

  const cargarPendientes = useCallback(() => {
    listarCargosPendientes().then(setPendientes).catch(() => setPendientes([]));
  }, []);
  useEffect(() => { cargarPendientes(); }, [cargarPendientes]);

  const consultar = async (doc = documento.trim()) => {
    if (!doc) return;
    setBuscando(true);
    setError(null);
    try {
      const datos = await obtenerCuentaCliente(doc);
      setCuenta(datos);
      setDocumento(doc);
      setForm((f) => ({ ...f, destino: datos.destinos[0] ? clave(datos.destinos[0]) : "" }));
    } catch (err) {
      setCuenta(null);
      setError(err.message);
    } finally {
      setBuscando(false);
    }
  };

  const clave = (d) => `${d.destino}|${d.idReserva || ""}`;
  const campo = (nombre) => ({ value: form[nombre], onChange: (e) => setForm({ ...form, [nombre]: e.target.value }) });
  const total = (Number(form.cantidad) || 0) * (Number(form.valorUnitario) || 0);

  const registrar = async (e) => {
    e.preventDefault();
    if (!form.destino) return setError("Este cliente no tiene reservas activas ni cuenta de socio a la que cargar.");
    const [destino, idReserva] = form.destino.split("|");
    setGuardando(true);
    setError(null);
    try {
      await registrarCargo({
        docUsuario: cuenta.docUsuario, concepto: form.concepto.trim(), categoria: form.categoria,
        cantidad: Number(form.cantidad), valorUnitario: Number(form.valorUnitario), destino, idReserva: idReserva || null,
      });
      Swal.fire({ title: "Consumo cargado", text: `${form.concepto} · ${pesos(total)}`, icon: "success", timer: 1600, showConfirmButton: false });
      setForm({ ...FORM_VACIO, destino: form.destino });
      consultar(cuenta.docUsuario);
      cargarPendientes();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const cobrar = async (titulo, detalle, opciones) => {
    const { isConfirmed } = await Swal.fire({
      title: titulo, html: detalle, icon: "question", showCancelButton: true,
      confirmButtonText: "Sí, registrar pago", cancelButtonText: "Volver", confirmButtonColor: "#38a169",
    });
    if (!isConfirmed) return;
    try {
      const r = await pagarPendientesCliente(cuenta.docUsuario, opciones);
      Swal.fire({ title: "Pago registrado", text: `${r.cantidad} ${r.cantidad === 1 ? "consumo" : "consumos"} · ${pesos(r.total)}`, icon: "success", timer: 1800, showConfirmButton: false });
      consultar(cuenta.docUsuario);
      cargarPendientes();
    } catch (err) {
      Swal.fire({ title: "No se pudo cobrar", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const accionCargo = async (c, tipo) => {
    if (tipo === "eliminar") {
      const { isConfirmed } = await Swal.fire({
        title: "¿Eliminar este consumo?", html: `<strong>${escapeHtml(c.concepto)}</strong> · ${pesos(c.total)}`,
        icon: "warning", showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Volver", confirmButtonColor: "#e53e3e",
      });
      if (!isConfirmed) return;
    }
    try {
      if (tipo === "eliminar") await eliminarCargo(c.id); else await pagarCargo(c.id);
      consultar(cuenta.docUsuario);
      cargarPendientes();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    }
  };

  const pendientesCliente = cuenta ? cuenta.cargos.filter((c) => c.estado === "PENDIENTE") : [];
  const porReserva = (idReserva) => pendientesCliente.filter((c) => c.idReserva === idReserva);

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Consumos y <span>cuentas</span></h1>
          <p className="gb-panel-subtitulo">Carga lo que el cliente consume a su reserva activa o a su cuenta de socio y cóbralo al check-out o a fin de mes.</p>
        </div>
      </div>

      <Form className="gb-tarjeta cg-buscar gb-form" onSubmit={(e) => { e.preventDefault(); consultar(); }}>
        <Form.Label htmlFor="cg-documento">Documento del cliente</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control id="cg-documento" value={documento} onChange={(e) => setDocumento(e.target.value.trim())} placeholder="Ej.: 52123456" inputMode="numeric" />
          <button type="submit" className="btn-gb btn-gb-primary" disabled={buscando || !documento}>
            {buscando ? <Spinner size="sm" /> : <BsSearch />} Buscar
          </button>
        </div>
      </Form>

      {error && <div className="alert alert-danger">{error}</div>}

      {cuenta && (
        <Row className="g-4 mb-4">
          <Col lg={5}>
            <div className="gb-tarjeta">
              <div className="cg-cliente">
                <div>
                  <strong className="d-block">{cuenta.nombreCliente}</strong>
                  <span className="gb-celda-secundaria">Doc. {cuenta.docUsuario}</span>
                </div>
                {cuenta.membresia !== "NINGUNA" && <span className="cg-socio"><BsAward /> {NOMBRE_MEMBRESIA[cuenta.membresia]}</span>}
              </div>
              <div className="cg-pendiente">
                <span>Pendiente por pagar</span>
                <strong>{pesos(cuenta.totalPendiente)}</strong>
              </div>

              <h2 className="gb-seccion-titulo mt-3">Registrar consumo</h2>
              {cuenta.destinos.length === 0 ? (
                <p className="gb-ayuda">Este cliente no tiene reservas confirmadas activas ni es socio: no hay a qué cargar el consumo.</p>
              ) : (
                <Form onSubmit={registrar} className="gb-form">
                  <div className="gb-chips mb-2">
                    {CONSUMOS_RAPIDOS.map((r) => (
                      <button key={r.concepto} type="button" className="gb-chip"
                        onClick={() => setForm({ ...form, concepto: r.concepto, categoria: r.categoria, valorUnitario: r.valor })}>
                        {r.concepto}
                      </button>
                    ))}
                  </div>
                  <Row className="g-2">
                    <Col xs={12}>
                      <Form.Label htmlFor="cg-concepto">Concepto *</Form.Label>
                      <Form.Control id="cg-concepto" required minLength={2} maxLength={80} placeholder="Ej.: Agua sin gas" {...campo("concepto")} />
                    </Col>
                    <Col sm={6}>
                      <Form.Label htmlFor="cg-categoria">Categoría</Form.Label>
                      <Form.Select id="cg-categoria" {...campo("categoria")}>
                        {Object.entries(CATEGORIAS_CARGO).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                      </Form.Select>
                    </Col>
                    <Col xs={6} sm={3}>
                      <Form.Label htmlFor="cg-cantidad">Cantidad</Form.Label>
                      <Form.Control id="cg-cantidad" type="number" min={1} max={100} required {...campo("cantidad")} />
                    </Col>
                    <Col xs={6} sm={3}>
                      <Form.Label htmlFor="cg-valor">Valor c/u *</Form.Label>
                      <Form.Control id="cg-valor" type="number" min={1} step={1} required {...campo("valorUnitario")} />
                    </Col>
                    <Col xs={12}>
                      <Form.Label htmlFor="cg-destino">Cargar a</Form.Label>
                      <Form.Select id="cg-destino" {...campo("destino")}>
                        {cuenta.destinos.map((d) => <option key={clave(d)} value={clave(d)}>{d.descripcion}</option>)}
                      </Form.Select>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="cg-total">Total: <strong>{pesos(total)}</strong></span>
                    <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
                      {guardando ? <Spinner size="sm" /> : <BsPlusLg />} Cargar consumo
                    </button>
                  </div>
                </Form>
              )}
            </div>
          </Col>

          <Col lg={7}>
            <div className="gb-tarjeta">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h2 className="gb-seccion-titulo m-0">Consumos del cliente</h2>
                <div className="d-flex flex-wrap gap-2">
                  {cuenta.destinos.filter((d) => d.idReserva && porReserva(d.idReserva).length).map((d) => (
                    <button key={d.idReserva} type="button" className="btn-gb btn-gb-neutral btn-gb-sm"
                      onClick={() => cobrar("¿Cobrar al hacer el check-out?", `${escapeHtml(d.descripcion)}<br><strong>${pesos(porReserva(d.idReserva).reduce((s, c) => s + c.total, 0))}</strong>`, { idReserva: d.idReserva })}>
                      <BsCheck2Circle /> Cobrar {d.destino === "RESERVA_HOTEL" ? "check-out" : "reserva"}
                    </button>
                  ))}
                  {pendientesCliente.some((c) => c.destino === "CUENTA_SOCIO") && (
                    <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm"
                      onClick={() => cobrar("¿Cobrar la cuenta de socio?", "Consumos cargados a la cuenta de socio (cierre de mes).", { soloCuentaSocio: true })}>
                      <BsCheck2Circle /> Cobrar cuenta de socio
                    </button>
                  )}
                  {pendientesCliente.length > 0 && (
                    <button type="button" className="btn-gb btn-gb-primary btn-gb-sm"
                      onClick={() => cobrar("¿Cobrar todo lo pendiente?", `<strong>${pesos(cuenta.totalPendiente)}</strong>`, {})}>
                      Cobrar todo
                    </button>
                  )}
                </div>
              </div>
              <TablaCargos cargos={cuenta.cargos} onAccion={accionCargo} vacio="Este cliente no tiene consumos registrados." />
            </div>
          </Col>
        </Row>
      )}

      <div className="gb-tarjeta">
        <h2 className="gb-seccion-titulo"><BsReceipt /> Pendientes de todos los clientes</h2>
        <TablaCargos cargos={pendientes} mostrarCliente onElegirCliente={(doc) => consultar(doc)}
          vacio="No hay consumos pendientes de pago." />
      </div>
    </div>
  );
}

function TablaCargos({ cargos, onAccion, mostrarCliente = false, onElegirCliente, vacio }) {
  if (cargos.length === 0) return <p className="gb-ayuda m-0">{vacio}</p>;
  return (
    <div className="gb-tabla-contenedor">
      <table className="gb-tabla">
        <thead>
          <tr>
            {mostrarCliente && <th>Cliente</th>}
            <th>Consumo</th><th>Cargado a</th><th>Total</th><th>Estado</th>{onAccion && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {cargos.map((c) => (
            <tr key={c.id}>
              {mostrarCliente && (
                <td>
                  <button type="button" className="cg-enlace" onClick={() => onElegirCliente(c.docUsuario)}>Doc. {c.docUsuario}</button>
                </td>
              )}
              <td>
                <span className="gb-celda-principal">{c.concepto} × {c.cantidad}</span>
                <span className="gb-celda-secundaria">{CATEGORIAS_CARGO[c.categoria]} · {fechaHora(c.fecha)}</span>
              </td>
              <td><span className="gb-celda-secundaria">{c.descripcionDestino}</span></td>
              <td className="gb-celda-principal">{pesos(c.total)}</td>
              <td>
                <span className={`gb-estado ${c.estado === "PAGADO" ? "gb-estado-confirmada" : "gb-estado-pendiente"}`}>
                  {c.estado === "PAGADO" ? "Pagado" : "Pendiente"}
                </span>
              </td>
              {onAccion && (
                <td>
                  {c.estado === "PENDIENTE" ? (
                    <div className="gb-acciones-fila">
                      <button type="button" className="btn-gb btn-gb-sm gb-btn-aprobar" onClick={() => onAccion(c, "pagar")}>Pagado</button>
                      <button type="button" className="btn-gb btn-gb-danger btn-gb-sm" aria-label={`Eliminar ${c.concepto}`} onClick={() => onAccion(c, "eliminar")}>
                        <BsTrash />
                      </button>
                    </div>
                  ) : <span className="gb-celda-secundaria">{fechaHora(c.fechaPago)}</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
