import { ROUTES } from "../support/routes.js";
import { espacios, reservaDeporte } from "../support/datos.js";

/** Elige en el calendario el día 15 del mes siguiente a las 10:00. */
const elegirEntrada = () => {
  cy.get("input[placeholder='dd/mm/aaaa --:--']").first().click();
  cy.get(".react-datepicker__navigation--next").click();
  cy.get(".react-datepicker__day--015:not(.react-datepicker__day--outside-month)").click();
  cy.get(".react-datepicker__time-list-item").contains(/^10:00$/).click();
};

describe("Reserva deportiva (cliente)", () => {
  beforeEach(() => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/espacios-deportivos", { body: espacios }).as("espacios");
  });

  it("muestra el catálogo y no deja reservar un espacio en mantenimiento", () => {
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.wait("@espacios");
    cy.get(".ge-card").should("have.length", 2);
    cy.contains(".ge-card", "Cancha de Pádel").should("have.class", "no-disponible").and("contain", "En mantenimiento");
    cy.contains(".ge-card", "Cancha de Pádel").click();
    cy.location("pathname").should("eq", ROUTES.reservasDeportivas);
    cy.contains("button", "Gestionar reservas").should("not.exist");
  });

  it("filtra el catálogo por deporte", () => {
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.contains(".gb-chip", "Tenis").click();
    cy.get(".ge-card").should("have.length", 1).and("contain", "Cancha de Tenis 1");
  });

  it("solicita una reserva: elige horario, confirma y la ve en Mis reservas", () => {
    cy.intercept("POST", "**/api/reservas/deporte", { statusCode: 201, body: reservaDeporte() }).as("crear");
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [reservaDeporte()] }).as("mias");
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.contains(".ge-card", "Cancha de Tenis 1").click();
    cy.location("pathname").should("eq", "/reservas-deportivas/reservar-espacio");
    cy.contains("h1", "Cancha de Tenis 1").should("be.visible");

    elegirEntrada();
    cy.get(".re-total strong").should("contain", "40.000");
    cy.get("input[placeholder='Ej.: balones, raquetas, petos...']").type("Raquetas");
    cy.contains("button", "Solicitar reserva").click();

    cy.dialogoDice("¿Enviar solicitud de reserva?");
    cy.get(".swal2-popup").should("contain", "Cancha de Tenis 1").and("contain", "10:00");
    cy.confirmarDialogo("Sí, enviar solicitud");
    cy.wait("@crear").its("request.body").should("deep.include", {
      espacioId: "e1", docUsuario: "52123456", implAlquilados: "Raquetas", rqrEntrenador: false,
    });
    cy.dialogoDice("¡Solicitud enviada!");
    cy.confirmarDialogo("OK");

    cy.location("pathname").should("eq", ROUTES.misReservasDeporte);
    cy.wait("@mias");
    cy.contains("tr", "Cancha de Tenis 1").should("contain", "Pendiente").and("contain", "Esperando aprobación");
  });

  it("envía la hora local correcta (sin correrse por la zona horaria)", () => {
    cy.intercept("POST", "**/api/reservas/deporte", { statusCode: 201, body: reservaDeporte() }).as("crear");
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [] });
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.contains(".ge-card", "Cancha de Tenis 1").click();
    elegirEntrada();
    cy.contains("button", "Solicitar reserva").click();
    cy.confirmarDialogo("Sí, enviar solicitud");
    cy.wait("@crear").its("request.body.fInicioReserva").should("match", /-15T10:00:00$/);
  });

  it("muestra el error del servidor si el horario ya se ocupó", () => {
    cy.intercept("POST", "**/api/reservas/deporte", {
      statusCode: 409, body: { codigo: "CONFLICTO", error: "El espacio ya está reservado en ese horario." },
    }).as("crear");
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.contains(".ge-card", "Cancha de Tenis 1").click();
    elegirEntrada();
    cy.contains("button", "Solicitar reserva").click();
    cy.confirmarDialogo("Sí, enviar solicitud");
    cy.wait("@crear");
    cy.dialogoDice("No se pudo reservar");
    cy.get(".swal2-html-container").should("contain", "El espacio ya está reservado en ese horario.");
  });

  it("cancela una reserva propia desde Mis reservas", () => {
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [reservaDeporte({ estado: "CONFIRMADA" })] }).as("mias");
    cy.intercept("PATCH", "**/api/reservas/deporte/rd1/cancelar*", { body: reservaDeporte({ estado: "CANCELADA" }) }).as("cancelar");
    cy.visitarComo("cliente", ROUTES.misReservasDeporte);
    cy.wait("@mias");
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", {
      body: [reservaDeporte({ estado: "CANCELADA", canceladaPor: "CLIENTE" })],
    });
    cy.contains("tr", "Cancha de Tenis 1").contains("button", "Cancelar").click();
    cy.dialogoDice("¿Cancelar esta reserva?");
    cy.get(".swal2-textarea").type("Cambio de planes");
    cy.confirmarDialogo("Sí, cancelar reserva");
    cy.wait("@cancelar");
    cy.dialogoDice("Reserva cancelada");
    cy.contains("tr", "Cancha de Tenis 1").should("contain", "Cancelada por ti");
  });
});
