import { ROUTES } from "../support/routes.js";
import { enDias, espacios, pagina, reservaDeporte, reservaHotel } from "../support/datos.js";

describe("Reprogramar una reserva (cambiar la fecha sin cancelarla)", () => {
  beforeEach(() => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/espacios-deportivos", { body: espacios });
  });

  it("el cliente cambia el horario de su reserva deportiva", () => {
    const nuevoDia = enDias(12);
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [reservaDeporte({ estado: "CONFIRMADA" })] });
    cy.intercept("PATCH", "**/api/reservas/deporte/rd1/reprogramar", {
      body: reservaDeporte({ estado: "PENDIENTE", fInicioReserva: `${nuevoDia}T15:00:00`, fFinReserva: `${nuevoDia}T17:00:00` }),
    }).as("reprogramar");
    cy.visitarComo("cliente", ROUTES.misReservasDeporte);
    cy.contains("tr", "Cancha de Tenis 1").contains("button", "Cambiar fecha").click();

    cy.get(".modal").should("contain", "Cambiar fecha").and("contain", "Cancha de Tenis 1");
    cy.get("#rp-dia").clear().type(nuevoDia);
    cy.get("#rp-hora").select("15:00");
    cy.get("#rp-duracion").select("120");
    cy.get(".rp-total").should("contain", "80.000"); // 2 h a 40.000
    cy.contains("button", "Guardar nueva fecha").click();

    cy.wait("@reprogramar").its("request.body").should("deep.equal", {
      inicio: `${nuevoDia}T15:00:00`, fin: `${nuevoDia}T17:00:00`,
    });
    cy.dialogoDice("Fecha actualizada");
  });

  it("el cliente cambia las fechas de su estadía y ve el total nuevo", () => {
    const entrada = enDias(25);
    const salida = enDias(28);
    cy.intercept("GET", "**/api/reservas/hotel/mis-reservas", { body: [reservaHotel({ pNoche: 180000 })] });
    cy.intercept("PATCH", "**/api/reservas/hotel/rh1/reprogramar", { body: reservaHotel() }).as("reprogramar");
    cy.visitarComo("cliente", ROUTES.misReservasHotel);
    cy.contains("tr", "N.º 101").contains("button", "Cambiar fecha").click();
    cy.get("#rp-checkin").clear().type(entrada);
    cy.get("#rp-checkout").clear().type(salida);
    cy.get(".rp-total").should("contain", "3 noches").and("contain", "540.000");
    cy.contains("button", "Guardar nueva fecha").click();
    cy.wait("@reprogramar").its("request.body").should("deep.equal", {
      inicio: `${entrada}T00:00:00`, fin: `${salida}T00:00:00`,
    });
    cy.dialogoDice("Fecha actualizada");
  });

  it("muestra el error del servidor dentro del diálogo (fechas ocupadas)", () => {
    cy.intercept("GET", "**/api/reservas/hotel/mis-reservas", { body: [reservaHotel()] });
    cy.intercept("PATCH", "**/api/reservas/hotel/rh1/reprogramar", {
      statusCode: 409, body: { codigo: "CONFLICTO", error: "Esta habitación ya está reservada para esas fechas." },
    });
    cy.visitarComo("cliente", ROUTES.misReservasHotel);
    cy.contains("button", "Cambiar fecha").click();
    cy.get("#rp-checkin").clear().type(enDias(30));
    cy.get("#rp-checkout").clear().type(enDias(31));
    cy.contains("button", "Guardar nueva fecha").click();
    cy.get(".modal .alert-danger").should("contain", "Esta habitación ya está reservada para esas fechas.");
  });

  it("no se ofrece cambiar la fecha de una reserva cancelada o finalizada", () => {
    cy.intercept("GET", "**/api/reservas/hotel/mis-reservas", { body: [reservaHotel({ estado: "CANCELADA", canceladaPor: "CLIENTE" })] });
    cy.visitarComo("cliente", ROUTES.misReservasHotel);
    cy.contains("tr", "N.º 101").contains("button", "Cambiar fecha").should("not.exist");
  });

  it("el administrador reprograma desde la gestión de reservas", () => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/reservas/hotel?*", { body: pagina([reservaHotel({ estado: "CONFIRMADA", pNoche: 180000 })]) });
    cy.intercept("PATCH", "**/api/reservas/hotel/rh1/reprogramar", { body: reservaHotel({ estado: "CONFIRMADA" }) }).as("reprogramar");
    cy.visitarComo("admin", ROUTES.gestionarReservasHotel);
    cy.contains("tr", "Laura Pérez").find("button[aria-label='Cambiar fecha']").click();
    cy.get(".modal").should("contain", "Habitación 101 · Laura Pérez");
    cy.get("#rp-checkout").clear().type(enDias(23));
    cy.contains("button", "Guardar nueva fecha").click();
    cy.wait("@reprogramar");
    cy.dialogoDice("Fecha actualizada");
    cy.get(".swal2-html-container").should("contain", "Se le avisó al cliente");
  });
});
