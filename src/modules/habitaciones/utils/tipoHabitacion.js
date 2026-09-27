/**
 * Datos del tipo de una habitación. La API de habitaciones devuelve el tipo
 * con los nombres internos (nomTipo, cap, desc) y la de tipos con otros
 * (nombreTipoHabitacion, capacidadMaxima, descripcion). Antes las pantallas
 * leían los segundos sobre la habitación y mostraban "—" y capacidad "2".
 */
export const datosTipo = (habitacion) => {
  const t = habitacion?.datosTipoHabitacion || {};
  return {
    id: t.id || null,
    nombre: t.nomTipo ?? t.nombreTipoHabitacion ?? null,
    capacidad: t.cap ?? t.capacidadMaxima ?? null,
    descripcion: t.desc ?? t.descripcion ?? null,
  };
};
