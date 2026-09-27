import { useEffect, useRef, useState } from "react";

const prefiereSinMovimiento = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Anima un número desde su valor anterior hasta `objetivo` (efecto contador).
 * Si el usuario pidió reducir animaciones, salta directo al valor final.
 */
export function useCuentaAnimada(objetivo, duracion = 900) {
  const [valor, setValor] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    const desde = anterior.current;
    const hasta = Number(objetivo) || 0;
    anterior.current = hasta;
    const total = prefiereSinMovimiento() || desde === hasta ? 0 : duracion;
    const inicio = performance.now();
    let frame;

    const paso = (t) => {
      const p = total === 0 ? 1 : Math.min(1, (t - inicio) / total);
      const suavizado = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      setValor(desde + (hasta - desde) * suavizado);
      if (p < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [objetivo, duracion]);

  return valor;
}
