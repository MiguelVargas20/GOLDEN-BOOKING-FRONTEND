import { ROUTES } from "../support/routes.js";
import { espacios, habitaciones, pagina, reservaDeporte } from "../support/datos.js";

describe("Calificaciones de espacios y habitaciones", () => {
  beforeEach(() => cy.simularApiBase("cliente"));

  it("el cliente califica una reserva finalizada", () => {
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [reservaDeporte({ estado: "FINALIZADA" })] });
    cy.intercept("POST", "**/api/calificaciones", { statusCode: 201, body: { id: "c1", puntuacion: 4 } }).as("calificar");
    cy.visitarComo("cliente", ROUTES.misReservasDeporte);
    cy.contains("tr", "Cancha de Tenis 1").contains("button", "Calificar").click();
    cy.get(".modal").should("contain", "Cancha de Tenis 1");
    cy.contains("button", "Enviar calificación").click();
    cy.get(".modal .alert-danger").should("contain", "Elige de 1 a 5 estrellas.");
    cy.get("button[aria-label='4 estrellas']").click();
    cy.get(".cal-selector-texto").should("contain", "Bueno");
    cy.get("#cal-comentario").type("Muy buena cancha");
    cy.contains("button", "Enviar calificación").click();
    cy.wait("@calificar").its("request.body").should("deep.equal", {
      categoria: "DEPORTE", idReserva: "rd1", puntuacion: 4, comentario: "Muy buena cancha",
    });
    cy.dialogoDice("¡Gracias por calificar!");
    cy.contains("tr", "Cancha de Tenis 1").should("contain", "Tu calificación");
    cy.contains("tr", "Cancha de Tenis 1").contains("button", "Calificar").should("not.exist");
  });

  it("una reserva ya calificada muestra sus estrellas", () => {
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [reservaDeporte({ estado: "FINALIZADA" })] });
    cy.intercept("GET", "**/api/calificaciones/mias", { body: [{ idReserva: "rd1", puntuacion: 5 }] });
    cy.visitarComo("cliente", ROUTES.misReservasDeporte);
    cy.contains("tr", "Cancha de Tenis 1").find(".cal-estrellas[aria-label='5 de 5 estrellas']").should("be.visible");
  });

  it("solo las reservas finalizadas se pueden calificar", () => {
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [reservaDeporte({ estado: "CONFIRMADA" })] });
    cy.visitarComo("cliente", ROUTES.misReservasDeporte);
    cy.contains("tr", "Cancha de Tenis 1").contains("button", "Calificar").should("not.exist");
  });

  it("los catálogos muestran el promedio de estrellas", () => {
    cy.intercept("GET", "**/api/espacios-deportivos", { body: espacios });
    cy.intercept("GET", "**/api/calificaciones/resumen?categoria=DEPORTE", { body: [{ idRecurso: "e1", promedio: 4.5, total: 12 }] });
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.contains(".ge-card", "Cancha de Tenis 1").should("contain", "4.5 (12)");
    cy.contains(".ge-card", "Cancha de Pádel").should("contain", "Sin calificaciones aún");
  });

  it("el detalle de la habitación muestra las opiniones", () => {
    cy.intercept("GET", "**/api/habitaciones/h1", { body: habitaciones[0] });
    cy.intercept("GET", "**/api/reservas/hotel/habitacion/*/ocupadas", { body: [] });
    cy.intercept("GET", "**/api/habitaciones?*", { body: pagina(habitaciones) });
    cy.intercept("GET", "**/api/calificaciones?categoria=HOTEL&idRecurso=h1", {
      body: [{ id: "c1", nombreCliente: "Laura P.", puntuacion: 5, comentario: "Excelente vista", fecha: "2026-09-20T10:00:00" }],
    });
    cy.visitarComo("cliente", "/habitaciones/h1");
    cy.contains(".cal-opiniones", "Excelente vista").should("contain", "Laura P.");
  });
});
