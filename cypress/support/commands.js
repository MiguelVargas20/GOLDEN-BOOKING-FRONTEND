// ***********************************************
// Comandos personalizados de Golden Booking
// ***********************************************
import { ROUTES } from "./routes";

// Visita cualquier ruta registrada y valida que quedó
// exactamente en baseUrl + ruta (nunca otro dominio/puerto)
Cypress.Commands.add("visitRoute", (routeKey) => {
  const path = ROUTES[routeKey];
  cy.visit(path);
  cy.url().should("eq", `${Cypress.config("baseUrl")}${path}`);
});

Cypress.Commands.add("login", (username, password) => {
  cy.visitRoute("login");
  cy.get("#username").type(username);
  cy.get("#password").type(password);
  cy.get('button[type="submit"]').click();
});

// Busca un texto dentro de una tabla paginada, avanzando de
// página en página con el botón "Siguiente" hasta encontrarlo
// o hasta que el botón quede deshabilitado (última página).
Cypress.Commands.add("buscarEnTablaPaginada", (texto) => {
  const intentar = () => {
    // 🆕 pequeño respiro: entre que el fetch responde y React termina de
    // pintar la fila hay una fracción de segundo. Sin esto, a veces leíamos
    // el body ANTES de que el texto apareciera y caíamos a buscar un botón
    // "Siguiente" que ni siquiera existe en tablas de una sola página.
    cy.wait(300);
    cy.get("body").then(($body) => {
      if ($body.text().includes(texto)) {
        cy.contains(texto).should("be.visible");
        return;
      }

      // 🆕 Buscamos el botón dentro del $body ya capturado (jQuery puro),
      // en vez de con cy.contains(), porque cy.contains() falla duro si no
      // encuentra nada — y "no hay botón" es un resultado válido (tabla de
      // una sola página), no un error de Cypress.
      const $btn = $body.find("button:contains('Siguiente')");

      if ($btn.length === 0) {
        throw new Error(
          `No se encontró "${texto}" y la tabla no tiene paginación (solo una página).`
        );
      }
      if ($btn.is(":disabled")) {
        throw new Error(
          `No se encontró "${texto}" en ninguna página de la tabla.`
        );
      }
      cy.wrap($btn).click();
      cy.wait(300);
      intentar();
    });
  };
  intentar();
});