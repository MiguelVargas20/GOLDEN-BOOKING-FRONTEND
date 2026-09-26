// Acompañantes de una reserva: tipos de documento, validación y limpieza.

export const TIPOS_DOC_MIEMBRO = {
  CC: "Cédula",
  TI: "Tarjeta de identidad",
  CE: "Cédula de extranjería",
  PA: "Pasaporte",
  RC: "Registro civil",
};

/** Revisa la lista antes de enviarla. @returns mensaje de error o null */
export function validarMiembros(miembros, docTitular) {
  const vistos = new Set();
  for (const m of miembros) {
    if (m.nombre.trim().length < 2) return "Escribe el nombre de cada acompañante.";
    if (!/^[A-Za-z0-9]{5,15}$/.test(m.numeroDocumento.trim())) return `El documento de ${m.nombre.trim() || "un acompañante"} debe tener entre 5 y 15 letras o números.`;
    if (m.numeroDocumento.trim() === docTitular) return "No te registres a ti mismo como acompañante.";
    if (vistos.has(m.numeroDocumento.trim())) return `El documento ${m.numeroDocumento.trim()} está repetido.`;
    vistos.add(m.numeroDocumento.trim());
  }
  return null;
}

/** Deja la lista lista para el backend (sin espacios sobrantes). */
export const limpiarMiembros = (miembros) => miembros.map((m) => ({
  nombre: m.nombre.trim(), tipoDocumento: m.tipoDocumento, numeroDocumento: m.numeroDocumento.trim(),
}));
