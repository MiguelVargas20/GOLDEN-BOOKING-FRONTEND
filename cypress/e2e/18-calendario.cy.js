import { ROUTES } from "../support/routes.js";
import { calendario, lunesActual } from "../support/datos.js";

describe("Calendario de ocupación (administrador)", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/calendario/semana*", (req) => {
      req.reply({ body: calendario(req.query.desde) });
    }).as("semana");
  });

  it("muestra las noches ocupadas de cada habitación en la semana actual", () => {
    cy.visitarComo("admin", ROUTES.calendario);
    cy.wait("@semana").its("request.query").should("deep.include", { desde: lunesActual() });
    cy.get(".cal-tabla thead th").should("have.length", 8);
    cy.contains("tr", "Habitación 101").find(".cal-confirmada").should("have.length", 2); // 2 noches
    cy.contains("tr", "Habitación 101").should("contain", "Entra").and("contain", "2/7 días ocupados");
    cy.contains("tr", "Habitación 102").should("contain", "En mantenimiento");
  });

  it("cambia a espacios deportivos con los horarios de cada día", () => {
    cy.visitarComo("admin", ROUTES.calendario);
    cy.contains(".gb-chip", "Espacios deportivos").click();
    cy.contains("tr", "Cancha de Tenis 1").find(".cal-bloque").should("have.length", 2);
    cy.contains("tr", "Cancha de Tenis 1").find(".cal-pendiente").should("contain", "Pedro G.");
  });

  it("navega a la semana siguiente", () => {
    cy.visitarComo("admin", ROUTES.calendario);
    cy.wait("@semana");
    cy.get("button[aria-label='Semana siguiente']").click();
    cy.wait("@semana").its("request.query.desde").should("not.eq", lunesActual());
  });

  it("un cliente no puede abrir el calendario", () => {
    cy.simularApiBase("cliente");
    cy.visitarComo("cliente", ROUTES.calendario);
    cy.location("pathname").should("eq", ROUTES.home);
  });
});
