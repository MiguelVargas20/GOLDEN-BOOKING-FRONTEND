import { ROUTES } from "../support/routes.js";
import { espacios, reservaDeporte } from "../support/datos.js";

/** "15/MM/yyyy" del mes siguiente (siempre futuro y dentro de la anticipación). */
const dia15MesSiguiente = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return `15/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

/** Elige el día 15 del mes siguiente en el calendario, a las 10:00, por 1 hora. */
const elegirEntrada = () => {
  cy.get("#re-dia").click();
  cy.get(".gb-calendario").should("be.visible");
  cy.get("#re-dia").type(`${dia15MesSiguiente()}{enter}`);
  cy.get("[data-hora='10:00']").click();
  cy.get("[data-duracion='60']").click();
};

describe("Reserva deportiva (cliente)", () => {
  beforeEach(() => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/espacios-deportivos", {
      body: espacios.map((e) => (e.id === "e1" ? { ...e, implementos: ["Raquetas", "Pelotas"] } : e)),
    }).as("espacios");
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
    // Implementos sugeridos del espacio: se eligen con un clic
    cy.contains(".re-implementos .gb-chip", "Pelotas").should("be.visible");
    cy.contains(".re-implementos .gb-chip", "Raquetas").click().should("have.attr", "aria-pressed", "true");
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
