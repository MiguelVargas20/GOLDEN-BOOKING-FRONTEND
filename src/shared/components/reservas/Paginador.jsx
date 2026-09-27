import "../../styles/PanelAdmin.css";

/** Paginación estándar de los listados (páginas empiezan en 0). */
export default function Paginador({ pagina, totalPaginas, totalElementos, etiqueta = "registros", onCambiar }) {
  if (!totalPaginas || totalPaginas <= 1) {
    return totalElementos ? <p className="gb-paginador-info">{totalElementos} {etiqueta}</p> : null;
  }
  return (
    <div className="gb-paginador">
      <span className="gb-paginador-info">
        Página {pagina + 1} de {totalPaginas} · {totalElementos} {etiqueta}
      </span>
      <div className="gb-paginador-botones">
        <button type="button" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>‹ Anterior</button>
        {[...Array(totalPaginas)].map((_, i) => (
          <button key={i} type="button" className={i === pagina ? "activa" : ""} onClick={() => onCambiar(i)}>
            {i + 1}
          </button>
        ))}
        <button type="button" disabled={pagina >= totalPaginas - 1} onClick={() => onCambiar(pagina + 1)}>Siguiente ›</button>
      </div>
    </div>
  );
}
