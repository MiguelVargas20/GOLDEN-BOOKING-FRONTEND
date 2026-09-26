import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { BsReceipt } from "react-icons/bs";
import { obtenerMiCuenta } from "../api/CargoApi";
import { CATEGORIAS_CARGO } from "../utils";
import { fechaHora, pesos } from "../../../shared/utils/formato";
import "../../../shared/styles/PanelAdmin.css";
import "../styles/Cargos.css";

/** Mi cuenta (cliente): consumos cargados a sus reservas o a su cuenta de socio. */
export default function MiCuenta() {
  const [cuenta, setCuenta] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { obtenerMiCuenta().then(setCuenta).catch((e) => setError(e.message)); }, []);

  if (error) return <div className="gb-panel"><div className="alert alert-danger">{error}</div></div>;
  if (!cuenta) return <div className="gb-panel text-center py-5"><Spinner style={{ color: "var(--gb-primary)" }} /></div>;

  // Agrupados por lo que se cargó (cada reserva o la cuenta de socio)
  const grupos = Object.values(cuenta.cargos.reduce((acc, c) => {
    const k = c.descripcionDestino || "Otros";
    (acc[k] ||= { nombre: k, cargos: [] }).cargos.push(c);
    return acc;
  }, {}));

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Mi <span>cuenta</span></h1>
          <p className="gb-panel-subtitulo">Consumos del restaurante, bar, tienda y servicios cargados a tus reservas o a tu cuenta de socio.</p>
        </div>
      </div>

      <div className="cg-pendiente cg-pendiente-grande mb-4">
        <span>Pendiente por pagar</span>
        <strong>{pesos(cuenta.totalPendiente)}</strong>
        <small>Se paga al hacer el check-out o, si eres socio, a fin de mes.</small>
      </div>

      {grupos.length === 0 ? (
        <div className="gb-vacio"><BsReceipt size={28} /><p className="m-0">Aún no tienes consumos registrados.</p></div>
      ) : grupos.map((g) => (
        <div key={g.nombre} className="gb-tarjeta mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="gb-seccion-titulo m-0">{g.nombre}</h2>
            <strong>{pesos(g.cargos.filter((c) => c.estado === "PENDIENTE").reduce((s, c) => s + c.total, 0))} pendiente</strong>
          </div>
          <ul className="cg-lista">
            {g.cargos.map((c) => (
              <li key={c.id}>
                <span>
                  <strong>{c.concepto} × {c.cantidad}</strong>
                  <small>{CATEGORIAS_CARGO[c.categoria]} · {fechaHora(c.fecha)}</small>
                </span>
                <span className="text-end">
                  <strong>{pesos(c.total)}</strong>
                  <small className={c.estado === "PAGADO" ? "cg-pagado" : "cg-por-pagar"}>{c.estado === "PAGADO" ? "Pagado" : "Pendiente"}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
