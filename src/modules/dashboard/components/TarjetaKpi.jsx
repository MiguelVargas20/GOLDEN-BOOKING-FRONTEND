import { useCuentaAnimada } from "../hooks/useCuentaAnimada";

/**
 * Indicador de un solo número con efecto contador.
 * `formato` decide cómo se muestra (entero por defecto); `pie` va debajo.
 */
export default function TarjetaKpi({ icono, titulo, valor, formato = (v) => Math.round(v).toLocaleString("es-CO"), pie, variante = "", onClick, indice = 0 }) {
  const animado = useCuentaAnimada(valor);
  const Etiqueta = onClick ? "button" : "div";
  return (
    <Etiqueta
      type={onClick ? "button" : undefined}
      className={`db-kpi db-aparecer ${variante} ${onClick ? "clicable" : ""}`}
      style={{ "--retraso": `${indice * 60}ms` }}
      onClick={onClick}
    >
      <span className="db-kpi-icono">{icono}</span>
      <span className="db-kpi-titulo">{titulo}</span>
      <span className="db-kpi-valor">{formato(animado)}</span>
      {pie && <span className="db-kpi-pie">{pie}</span>}
    </Etiqueta>
  );
}
