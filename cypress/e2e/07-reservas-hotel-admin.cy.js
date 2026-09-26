import { ROUTES } from "../support/routes.js";
import { pagina, reservaHotel } from "../support/datos.js";

describe("Reservas hoteleras (administrador)", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/reservas/hotel/resumen", { body: { PENDIENTE: 1, CANCELADA: 1 } });
    cy.intercept("GET", "**/api/reservas/hotel?*", {
      body: pagina([
        reservaHotel(),
        reservaHotel({ idH: "rh2", nombreCliente: "Pedro Gómez", estado: "CANCELADA", canceladaPor: "SISTEMA", registradaPorAdministrador: true }),
      ]),
    }).as("listar");
  });

  it("lista las estadías con huésped, noches y estado", () => {
    cy.visitarComo("admin", ROUTES.gestionarReservasHotel);
    cy.wait("@listar");
    cy.contains("tr", "Laura Pérez").should("contain", "N.º 101").and("contain", "2 noches").and("contain", "360.000");
    cy.contains("tr", "Pedro Gómez").should("contain", "Vencida: no se aprobó a tiempo")
      .and("contain", "Registrada en recepción");
    cy.contains("tr", "Pedro Gómez").contains("button", "Aprobar").should("not.exist");
    cy.contains("tr", "Pedro Gómez").find("button[aria-label='Ver historial']").should("be.visible");
  });

  it("aprueba una reserva hotelera", () => {
    cy.intercept("PATCH", "**/api/reservas/hotel/rh1/confirmar", { body: reservaHotel({ estado: "CONFIRMADA" }) }).as("aprobar");
    cy.visitarComo("admin", ROUTES.gestionarReservasHotel);
    cy.contains("tr", "Laura Pérez").contains("button", "Aprobar").click();
    cy.get(".swal2-popup").should("contain", "N.º 101");
    cy.confirmarDialogo("Sí, aprobar");
    cy.wait("@aprobar");
    cy.dialogoDice("Reserva aprobada");
  });

  it("cancela una reserva hotelera con motivo", () => {
    cy.intercept("PATCH", "**/api/reservas/hotel/rh1/cancelar", { body: reservaHotel({ estado: "CANCELADA" }) }).as("cancelar");
    cy.visitarComo("admin", ROUTES.gestionarReservasHotel);
    cy.contains("tr", "Laura Pérez").contains("button", "Cancelar").click();
    cy.get(".swal2-textarea").type("Sobreventa de habitaciones");
    cy.confirmarDialogo("Sí, cancelar reserva");
    cy.wait("@cancelar").its("request.body").should("deep.equal", { motivo: "Sobreventa de habitaciones" });
    cy.dialogoDice("Reserva cancelada");
  });

  it("abre la recepción para reservar a nombre de un cliente", () => {
    cy.visitarComo("admin", ROUTES.gestionarReservasHotel);
    cy.contains("button", "Reservar para un cliente").click();
    cy.location("pathname").should("eq", ROUTES.recepcion);
    cy.location("search").should("eq", "?tipo=hotel");
  });
});
