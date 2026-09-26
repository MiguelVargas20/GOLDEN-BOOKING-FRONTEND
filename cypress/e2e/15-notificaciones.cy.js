import { ROUTES } from "../support/routes.js";
import { notificaciones } from "../support/datos.js";

describe("Notificaciones del cliente (campana)", () => {
  beforeEach(() => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/notificaciones/no-leidas/count", { body: { noLeidas: 2 } }).as("contar");
    cy.intercept("GET", "**/api/notificaciones", { body: notificaciones }).as("listar");
  });

  it("muestra cuántas hay sin leer y la lista al abrir la campana", () => {
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.get("button[aria-label='Notificaciones']").should("contain", "2").click();
    cy.wait("@listar");
    cy.get(".cn-item").should("have.length", 3);
    cy.contains(".cn-item", "Reserva aprobada").should("have.class", "no-leida").and("contain", "habitación 101");
    cy.contains(".cn-item", "Reserva cancelada").should("contain", "Motivo: Mantenimiento");
    cy.contains(".cn-item", "¿Cómo te fue?").should("not.have.class", "no-leida");
  });

  it("al abrir una notificación la marca como leída y lleva a sus reservas", () => {
    cy.intercept("PATCH", "**/api/notificaciones/n1/leida", { body: { ...notificaciones[0], leida: true } }).as("leida");
    cy.intercept("GET", "**/api/reservas/hotel/mis-reservas", { body: [] });
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.get("button[aria-label='Notificaciones']").click();
    cy.contains(".cn-item", "Reserva aprobada").click();
    cy.wait("@leida");
    cy.location("pathname").should("eq", ROUTES.misReservasHotel);
    cy.get("button[aria-label='Notificaciones']").should("contain", "1");
  });

  it("marca todas como leídas", () => {
    cy.intercept("PATCH", "**/api/notificaciones/leidas", { body: { marcadas: 2 } }).as("todas");
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.get("button[aria-label='Notificaciones']").click();
    cy.contains("button", "Marcar todas como leídas").click();
    cy.wait("@todas");
    cy.get(".cn-item.no-leida").should("have.length", 0);
    cy.get(".cn-contador").should("not.exist");
  });

  it("sin notificaciones muestra un mensaje", () => {
    cy.intercept("GET", "**/api/notificaciones/no-leidas/count", { body: { noLeidas: 0 } });
    cy.intercept("GET", "**/api/notificaciones", { body: [] });
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.get("button[aria-label='Notificaciones']").click();
    cy.contains(".cn-menu", "No tienes notificaciones.").should("be.visible");
  });

  it("el administrador no tiene la campana de cliente", () => {
    cy.simularApiBase("admin");
    cy.visitarComo("admin", ROUTES.contactos);
    cy.get("button[aria-label='Notificaciones']").should("not.exist");
    cy.get("[title='Bandeja de mensajes']").should("be.visible");
  });
});
