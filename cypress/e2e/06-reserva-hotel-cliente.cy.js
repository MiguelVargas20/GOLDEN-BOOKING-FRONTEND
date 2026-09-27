import { ROUTES } from "../support/routes.js";
import { aDMY, enDias, habitaciones, pagina, reservaHotel } from "../support/datos.js";

const escribirFecha = (id, iso) => cy.get(id).type(`${aDMY(iso)}{enter}`);

describe("Reserva hotelera (cliente)", () => {
  beforeEach(() => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/habitaciones?*", { body: pagina(habitaciones) }).as("habitaciones");
    cy.intercept("GET", "**/api/reservas/hotel/habitacion/*/ocupadas", { body: [] });
    cy.intercept("GET", "**/api/habitaciones/h1", { body: habitaciones[0] }).as("detalle");
  });

  it("muestra el catálogo con precios y la habitación en mantenimiento sin reservar", () => {
    cy.visitarComo("cliente", ROUTES.habitaciones);
    cy.wait("@habitaciones");
    cy.get(".ge-card").should("have.length", 2);
    cy.contains(".ge-card", "Habitación 101").should("contain", "180.000").and("contain", "Disponible");
    cy.contains(".ge-card", "Habitación 102").contains("button", "No disponible").should("be.disabled");
  });

  it("ordena por precio de menor a mayor", () => {
    cy.visitarComo("cliente", ROUTES.habitaciones);
    cy.get("select").select("asc");
    cy.get(".ge-card").first().should("contain", "Habitación 102");
  });

  it("reserva desde el detalle: calcula las noches, confirma y va a Mis reservas", () => {
    const entrada = enDias(20);
    const salida = enDias(22);
    cy.intercept("POST", "**/api/reservas/hotel", { statusCode: 201, body: reservaHotel() }).as("crear");
    cy.intercept("GET", "**/api/reservas/hotel/mis-reservas", { body: [reservaHotel()] }).as("mias");

    cy.visitarComo("cliente", ROUTES.habitaciones);
    cy.contains(".ge-card", "Habitación 101").contains("button", "Ver detalle").click();
    cy.location("pathname").should("eq", "/habitaciones/h1");
    cy.contains("h1", "101").should("be.visible");

    escribirFecha("#dh-checkin", entrada);
    escribirFecha("#dh-checkout", salida);
    cy.get(".dh-total").should("contain", "2 noches").and("contain", "360.000");
    cy.contains("button", "Enviar solicitud de reserva").click();

    cy.dialogoDice("¿Enviar solicitud de reserva?");
    cy.get(".swal2-popup").should("contain", "3:00 p. m.").and("contain", "12:00 m.");
    cy.confirmarDialogo("Sí, enviar solicitud");
    cy.wait("@crear").its("request.body").should("deep.include", {
      docUsuario: "52123456",
      idHabitacion: "h1",
      fCheckIn: `${entrada}T00:00:00`,
      fCheckOut: `${salida}T00:00:00`,
    });
    cy.dialogoDice("¡Solicitud enviada!");
    cy.confirmarDialogo("OK");

    cy.location("pathname").should("eq", ROUTES.misReservasHotel);
    cy.wait("@mias");
    cy.contains("tr", "N.º 101").should("contain", "2 noches").and("contain", "Pendiente");
  });

  it("avisa sin llamar al servidor si las fechas se cruzan con otra reserva", () => {
    cy.intercept("GET", "**/api/reservas/hotel/habitacion/h1/ocupadas", {
      body: [{ checkIn: `${enDias(20)}T15:00:00`, checkOut: `${enDias(23)}T12:00:00` }],
    });
    cy.visitarComo("cliente", "/habitaciones/h1");
    cy.contains("Tiene 1 fecha reservada").should("be.visible");
    escribirFecha("#dh-checkin", enDias(21));
    escribirFecha("#dh-checkout", enDias(24));
    cy.contains("button", "Enviar solicitud de reserva").click();
    cy.dialogoDice("Fechas no disponibles");
  });

  it("pide las dos fechas antes de enviar", () => {
    cy.visitarComo("cliente", "/habitaciones/h1");
    cy.contains("button", "Enviar solicitud de reserva").click();
    cy.dialogoDice("Fechas requeridas");
  });

  it("muestra el motivo cuando la administración canceló la reserva", () => {
    cy.intercept("GET", "**/api/reservas/hotel/mis-reservas", {
      body: [reservaHotel({ estado: "CANCELADA", canceladaPor: "ADMINISTRADOR", motivoCancelacion: "Habitación en remodelación" })],
    });
    cy.visitarComo("cliente", ROUTES.misReservasHotel);
    cy.contains("tr", "N.º 101").should("contain", "Cancelada por la administración: Habitación en remodelación");
    cy.contains("tr", "N.º 101").contains("button", "Cancelar").should("not.exist");
  });
});
