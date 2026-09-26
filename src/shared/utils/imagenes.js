// Validación de imágenes antes de subirlas: mismas reglas que el backend
// (AlmacenImagenes) para espacios deportivos y habitaciones.

export const REGLAS_IMAGEN = {
  tipos: ["image/jpeg", "image/png", "image/webp"],
  tamanioMaximo: 5 * 1024 * 1024,
  anchoMinimo: 400,
  altoMinimo: 300,
  ladoMaximo: 8000,
};

/**
 * Valida una imagen ANTES de subirla: formato, peso y dimensiones.
 * @returns {Promise<string|null>} mensaje de error, o null si es válida.
 */
export const validarImagen = (archivo) => new Promise((resolver) => {
  if (!REGLAS_IMAGEN.tipos.includes(archivo.type)) {
    resolver("Formato no permitido. Sube una imagen JPG, PNG o WEBP.");
    return;
  }
  if (archivo.size > REGLAS_IMAGEN.tamanioMaximo) {
    resolver("La imagen pesa más de 5 MB.");
    return;
  }
  const url = URL.createObjectURL(archivo);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    const { naturalWidth: ancho, naturalHeight: alto } = img;
    if (ancho < REGLAS_IMAGEN.anchoMinimo || alto < REGLAS_IMAGEN.altoMinimo) {
      resolver(`La imagen es muy pequeña (${ancho}×${alto} px). El mínimo es ${REGLAS_IMAGEN.anchoMinimo}×${REGLAS_IMAGEN.altoMinimo} px.`);
    } else if (ancho > REGLAS_IMAGEN.ladoMaximo || alto > REGLAS_IMAGEN.ladoMaximo) {
      resolver(`La imagen es demasiado grande (${ancho}×${alto} px). El máximo es ${REGLAS_IMAGEN.ladoMaximo} px por lado.`);
    } else {
      resolver(null);
    }
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    resolver("El archivo está dañado o no es una imagen válida.");
  };
  img.src = url;
});
