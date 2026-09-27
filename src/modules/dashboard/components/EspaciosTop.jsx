/**
 * Espacios deportivos más reservados del periodo (barras horizontales, un
 * solo color; el valor va al final de cada barra).
 */
export default function EspaciosTop({ espacios }) {
  if (espacios.length === 0) {
    return <p className="db-vacio">Sin reservas deportivas en este periodo.</p>;
  }
  const maximo = Math.max(...espacios.map((e) => e.reservas));

  return (
    <ul className="db-ranking">
      {espacios.map((e, i) => (
        <li key={e.espacioId} className="db-ranking-fila" title={`${e.reservas} reservas · ${e.horas} h`}>
          <span className="db-ranking-nombre">{e.nombre}</span>
          <div className="db-ranking-pista">
            <div className="db-ranking-barra" style={{ "--ancho": `${(e.reservas / maximo) * 100}%`, "--retraso": `${i * 80}ms` }} />
            <span className="db-ranking-valor">{e.reservas} <small>· {e.horas} h</small></span>
          </div>
        </li>
      ))}
    </ul>
  );
}
