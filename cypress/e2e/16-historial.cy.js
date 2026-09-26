import { ROUTES } from "../support/routes.js";
import { historial, pagina, reservaDeporte } from "../support/datos.js";

describe("Historial de cada reserva (administrador)", () => {
  beforeEach(() => cy.simularApiBase("admin"));

  it("muestra quién creó, aprobó y reprogramó la reserva y cuándo", () => {
    cy.intercept("GET", "**/api/reservas/deporte?*", { body: pagina([reservaDeporte({ estado: "CONFIRMADA", historial })]) });
    cy.visitarComo("admin", ROUTES.gestionarReservasD);
    cy.contains("tr", "Laura Pérez").find("button[aria-label='Ver historial']").click();
    cy.dialogoDice("Historial de la reserva");
    cy.get(".gb-historial li").should("have.length", 3);
    cy.get(".gb-historial li").eq(0).should("contain", "Solicitada").and("contain", "laura (cliente)");
    cy.get(".gb-historial li").eq(1).should("contain", "Aprobada").and("contain", "admin (administración)");
    cy.get(".gb-historial li").eq(2).should("contain", "Reprogramada").and("contain", "Horario anterior");
  });

  it("reconstruye el historial de reservas antiguas con sus fechas", () => {
    cy.intercept("GET", "**/api/reservas/deporte?*", {
      body: pagina([reservaDeporte({
        estado: "CANCELADA", canceladaPor: "ADMINISTRADOR", motivoCancelacion: "Cancha en mantenimiento",
        fechaConfirmacion: "2026-09-20T10:00:00", fechaCancelacion: "2026-09-21T11:00:00", historial: null,
      })]),
    });
    cy.visitarComo("admin", ROUTES.gestionarReservasD);
    cy.contains("tr", "Laura Pérez").find("button[aria-label='Ver historial']").click();
    cy.get(".gb-historial li").should("have.length", 3);
    cy.get(".gb-historial li").eq(2).should("contain", "Cancelada").and("contain", "Cancha en mantenimiento");
  });
});
