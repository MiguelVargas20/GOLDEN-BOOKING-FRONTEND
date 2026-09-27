import { ROUTES } from "../support/routes.js";
import { reporte } from "../support/datos.js";

describe("Reportes de reservas e ingresos (administrador)", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/reportes?*", (req) => {
      req.reply({ body: reporte(req.query.desde, req.query.hasta) });
    }).as("reporte");
  });

  it("genera el reporte del mes actual con los totales", () => {
    cy.visitarComo("admin", ROUTES.reportes);
    cy.wait("@reporte").its("request.query.desde").should("match", /-01$/);
    cy.contains(".rp-kpi", "Reservas").should("contain", "3").and("contain", "2 deportivas");
    cy.contains(".rp-kpi", "Ingresos").should("contain", "400.000");
    cy.get(".gb-tabla tbody tr").should("have.length", 3);
    cy.contains("tr", "Pedro Gómez").should("contain", "Cancha de Tenis 1").and("contain", "Confirmada");
  });

  it("genera el reporte de un rango elegido", () => {
    cy.visitarComo("admin", ROUTES.reportes);
    cy.wait("@reporte");
    cy.get("#rp-desde").clear().type("2026-01-01");
    cy.get("#rp-hasta").clear().type("2026-03-31");
    cy.contains("button", "Generar reporte").click();
    cy.wait("@reporte").its("request.query").should("deep.equal", { desde: "2026-01-01", hasta: "2026-03-31" });
  });

  it("usa los rangos rápidos", () => {
    cy.visitarComo("admin", ROUTES.reportes);
    cy.wait("@reporte");
    cy.contains(".gb-chip", "Este año").click();
    cy.wait("@reporte").its("request.query.desde").should("match", /-01-01$/);
  });

  it("descarga el Excel y el PDF con el mismo rango", () => {
    cy.intercept("GET", "**/api/reportes/excel?*", { body: "excel", headers: { "content-type": "application/octet-stream" } }).as("excel");
    cy.intercept("GET", "**/api/reportes/pdf?*", { body: "%PDF-1.4", headers: { "content-type": "application/pdf" } }).as("pdf");
    cy.visitarComo("admin", ROUTES.reportes);
    cy.wait("@reporte");
    cy.contains("button", "Descargar Excel").click();
    cy.wait("@excel").its("request.query.desde").should("match", /-01$/);
    cy.contains("button", "Descargar PDF").click();
    cy.wait("@pdf");
  });

  it("muestra el error del servidor (rango mayor a un año)", () => {
    cy.intercept("GET", "**/api/reportes?*", {
      statusCode: 400, body: { codigo: "SOLICITUD_INVALIDA", error: "El reporte puede abarcar como máximo un año." },
    });
    cy.visitarComo("admin", ROUTES.reportes);
    cy.get(".alert-danger").should("contain", "El reporte puede abarcar como máximo un año.");
  });
});
