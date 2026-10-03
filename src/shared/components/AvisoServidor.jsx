import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { BsCheckCircle, BsExclamationTriangle } from "react-icons/bs";
import { API_URL } from "../api/apiUtils";
import "../styles/AvisoServidor.css";

const ESPERA_ANTES_DE_AVISAR = 2500; // ms: si responde antes, no se muestra nada
const REINTENTO = 4000;              // ms entre intentos mientras despierta
const LIMITE = 120000;               // ms: después de 2 min se da por caído

/**
 * Aviso de "servidor despertando". El backend está en el plan gratis de
 * Render, que lo duerme tras ~15 min sin visitas y tarda ~1 min en arrancar.
 * Mientras tanto el login daría "Failed to fetch" sin explicación; este aviso
 * le dice al visitante qué pasa y desaparece solo cuando el backend responde.
 *
 * Cualquier respuesta HTTP (aunque sea un error) cuenta como "despierto":
 * solo un fallo de red o un tiempo de espera agotado significa que sigue
 * arrancando.
 */
export default function AvisoServidor() {
  const [estado, setEstado] = useState("revisando"); // revisando | despertando | listo | caido | oculto

  useEffect(() => {
    if (!API_URL) return undefined;
    let activo = true;
    let avisoMostrado = false;
    let temporizador;
    const inicio = Date.now();

    const aviso = setTimeout(() => {
      if (!activo) return;
      avisoMostrado = true;
      setEstado("despertando");
    }, ESPERA_ANTES_DE_AVISAR);

    const consultar = async () => {
      const control = new AbortController();
      const corte = setTimeout(() => control.abort(), 10000);
      try {
        // "no-cors": solo importa si el servidor responde, no leer la respuesta;
        // así el aviso no depende de que CORS esté configurado para este dominio
        await fetch(`${API_URL}/actuator/health`, { mode: "no-cors", signal: control.signal, cache: "no-store" });
        if (!activo) return;
        clearTimeout(aviso);
        if (avisoMostrado) {
          setEstado("listo");
          temporizador = setTimeout(() => activo && setEstado("oculto"), 2500);
        } else {
          setEstado("oculto");
        }
      } catch {
        if (!activo) return;
        if (Date.now() - inicio > LIMITE) { setEstado("caido"); return; }
        temporizador = setTimeout(consultar, REINTENTO);
      } finally {
        clearTimeout(corte);
      }
    };
    consultar();

    return () => { activo = false; clearTimeout(aviso); clearTimeout(temporizador); };
  }, []);

  if (estado === "despertando") {
    return (
      <div className="gb-aviso-servidor" role="status" aria-live="polite">
        <Spinner animation="border" size="sm" />
        <div>
          <strong>Despertando el servidor…</strong>
          <span>El backend está en un plan gratuito que se duerme cuando no hay visitas. Puede tardar hasta un minuto; puedes ir escribiendo tus datos.</span>
        </div>
      </div>
    );
  }
  if (estado === "listo") {
    return (
      <div className="gb-aviso-servidor listo" role="status" aria-live="polite">
        <BsCheckCircle />
        <div><strong>¡Servidor listo!</strong></div>
      </div>
    );
  }
  if (estado === "caido") {
    return (
      <div className="gb-aviso-servidor caido" role="alert">
        <BsExclamationTriangle />
        <div>
          <strong>No pudimos conectar con el servidor.</strong>
          <span>Intenta de nuevo en unos minutos.</span>
        </div>
      </div>
    );
  }
  return null;
}
