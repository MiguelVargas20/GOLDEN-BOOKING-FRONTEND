// Comandos propios de Golden Booking para Cypress.
// Todas las pruebas simulan el backend con cy.intercept: no hace falta tener
// el servidor ni MongoDB corriendo, solo el frontend (npm run dev).
import { tokenFalso, SESIONES, perfil } from "./datos.js";

/**
 * Respuestas que la app pide en segundo plano en cualquier pantalla
 * (contadores de la campana y del menú, perfil). Cada prueba agrega las suyas
 * después: si se repite una URL, gana la última que se definió.
 */
Cypress.Commands.add("simularApiBase", (rol = "cliente") => {
  cy.intercept("GET", "**/api/usuarios/perfil/*", { body: perfil(rol) }).as("perfil");
  cy.intercept("GET", "**/api/contacto/no-leidos/count", { body: { noLeidos: 0 } });
  cy.intercept("GET", "**/api/contacto/mios/no-vistas/count", { body: { noVistas: 0 } });
  cy.intercept("GET", "**/api/reservas/deporte/resumen", { body: { PENDIENTE: 0 } });
  cy.intercept("GET", "**/api/reservas/hotel/resumen", { body: { PENDIENTE: 0 } });
  cy.intercept("GET", "**/api/reservas/deporte/ocupadas", { body: [] });
  cy.intercept("GET", "**/api/notificaciones/no-leidas/count", { body: { noLeidas: 0 } });
  cy.intercept("GET", "**/api/notificaciones", { body: [] });
  cy.intercept("GET", "**/api/calificaciones/resumen*", { body: [] });
  cy.intercept("GET", "**/api/calificaciones/mias", { body: [] });
  cy.intercept("GET", "**/api/calificaciones?*", { body: [] });
});

/**
 * Entra directo a una ruta con la sesión ya iniciada (sin pasar por el login).
 * @param {"admin"|"cliente"} rol
 * @param {string} ruta
 */
Cypress.Commands.add("visitarComo", (rol, ruta) => {
  cy.visit(ruta, {
    onBeforeLoad(win) {
      win.localStorage.setItem("token", tokenFalso(SESIONES[rol].usuario));
      win.localStorage.setItem("user", JSON.stringify(SESIONES[rol]));
    },
  });
});

/** Pulsa un botón del diálogo (SweetAlert) que está abierto. */
Cypress.Commands.add("confirmarDialogo", (textoBoton) => {
  cy.get(".swal2-popup").should("be.visible").contains("button", textoBoton).click();
});

/** Verifica el título del diálogo (SweetAlert) que está abierto. */
Cypress.Commands.add("dialogoDice", (titulo) => {
  cy.get(".swal2-title").should("be.visible").and("contain", titulo);
});
