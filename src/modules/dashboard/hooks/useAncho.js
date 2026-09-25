import { useEffect, useRef, useState } from "react";

/** Ancho (px) de un contenedor, actualizado al cambiar de tamaño. Para los gráficos SVG. */
export function useAncho(inicial = 600) {
  const ref = useRef(null);
  const [ancho, setAncho] = useState(inicial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observador = new ResizeObserver(([entrada]) => {
      setAncho(Math.max(240, Math.floor(entrada.contentRect.width)));
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return [ref, ancho];
}
