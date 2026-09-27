import { ROUTES } from "../support/routes.js";
import { dashboard } from "../support/datos.js";

describe("Panel de control (administrador)", () => {
  beforeEach(() => cy.simularApiBase("admin"));

  it("muestra los indicadores y las reservas por aprobar", () => {
    cy.intercept("GET", "**/api/dashboard*", { body: dashboard() }).as("dashboard");
    cy.visitarComo("admin", ROUTES.home);
    cy.wait("@dashboard").its("request.query").should("deep.include", { dias: "14" });
    cy.contains("h1", "Panel de").should("be.visible");
    cy.contains("Pendientes por aprobar").should("be.visible");
    cy.contains("Por aprobar").should("be.visible");
    cy.contains("Laura Pérez").should("be.visible");
    cy.contains("Cancha de Tenis 1").should("be.visible");
  });

  it("cambia el periodo de la tendencia", () => {
    cy.intercept("GET", "**/api/dashboard*", { body: dashboard() }).as("dashboard");
    cy.visitarComo("admin", ROUTES.home);
    cy.wait("@dashboard");
    cy.get(".db-filtro").contains("30").click();
    cy.wait("@dashboard").its("request.query").should("deep.include", { dias: "30" });
  });

  it("si el servidor falla muestra el error y permite reintentar", () => {
    cy.intercept("GET", "**/api/dashboard*", { statusCode: 500, body: { codigo: "ERROR_INTERNO", error: "No se pudo cargar el panel." } }).as("dashboard");
    cy.visitarComo("admin", ROUTES.home);
    cy.get(".alert-danger").should("contain", "No se pudo cargar el panel.");
    cy.intercept("GET", "**/api/dashboard*", { body: dashboard() }).as("dashboard2");
    cy.contains("button", "Reintentar").click();
    cy.wait("@dashboard2");
    cy.contains("h1", "Panel de").should("be.visible");
  });

  it("el cliente ve la portada con los servicios, no el panel", () => {
    cy.simularApiBase("cliente");
    cy.visitarComo("cliente", ROUTES.home);
    cy.contains("RESERVAS ESPACIOS").should("be.visible");
    cy.contains("Panel de control").should("not.exist");
  });
});
