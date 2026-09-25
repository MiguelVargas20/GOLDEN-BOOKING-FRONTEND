// Escapa texto antes de interpolarlo en el `html:` de SweetAlert.
// Los datos que vienen del backend (nombre de cancha, número de habitación,
// nombre de tipo...) los puede escribir un usuario; sin escapar, un valor como
// `<img src=x onerror=...>` se ejecutaría en el navegador de quien abre el
// diálogo (XSS almacenado, con acceso al token guardado en el storage).
export const escapeHtml = (valor) =>
  String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
