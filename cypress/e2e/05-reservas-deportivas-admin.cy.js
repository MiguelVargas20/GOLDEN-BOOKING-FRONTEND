import { ROUTES } from "../support/routes.js";
import { espacios, pagina, reservaDeporte } from "../support/datos.js";

describe("Reservas deportivas (administrador)", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/reservas/deporte/resumen", { body: { PENDIENTE: 1, CONFIRMADA: 1 } });
    cy.intercept("GET", "**/api/reservas/deporte?*", {
      body: pagina([reservaDeporte(), reservaDeporte({ idD: "rd2", nombreCliente: "Pedro Gómez", estado: "CONFIRMADA" })]),
    }).as("listar");
  });

  it("lista las reservas con su estado y filtra por pendientes", () => {
    cy.visitarComo("admin", ROUTES.gestionarReservasD);
    cy.wait("@listar");
    cy.get(".gb-tabla tbody tr").should("have.length", 2);
    cy.contains("tr", "Laura Pérez").should("contain", "Pendiente").and("contain", "Aprobar");
    cy.contains("tr", "Pedro Gómez").should("contain", "Confirmada");
    cy.contains("tr", "Pedro Gómez").contains("button", "Aprobar").should("not.exist");
    cy.contains("button", "Pendientes").click();
    cy.wait("@listar").its("request.query").should("deep.include", { estado: "PENDIENTE" });
    cy.location("search").should("eq", "?estado=PENDIENTE");
  });

  it("busca dentro de la página", () => {
    cy.visitarComo("admin", ROUTES.gestionarReservasD);
    cy.get("input[placeholder='Buscar en esta página...']").type("pedro");
    cy.get(".gb-tabla tbody tr").should("have.length", 1).and("contain", "Pedro Gómez");
  });

  it("aprueba una reserva pendiente", () => {
    cy.intercept("PATCH", "**/api/reservas/deporte/rd1/confirmar", { body: reservaDeporte({ estado: "CONFIRMADA" }) }).as("aprobar");
    cy.visitarComo("admin", ROUTES.gestionarReservasD);
    cy.contains("tr", "Laura Pérez").contains("button", "Aprobar").click();
    cy.dialogoDice("¿Aprobar esta reserva?");
    cy.get(".swal2-popup").should("contain", "Cancha de Tenis 1");
    cy.confirmarDialogo("Sí, aprobar");
    cy.wait("@aprobar");
    cy.dialogoDice("Reserva aprobada");
  });

  it("exige el motivo para cancelar y lo envía al servidor", () => {
    cy.intercept("PATCH", "**/api/reservas/deporte/rd1/cancelar", { body: reservaDeporte({ estado: "CANCELADA" }) }).as("cancelar");
    cy.visitarComo("admin", ROUTES.gestionarReservasD);
    cy.contains("tr", "Laura Pérez").contains("button", "Cancelar").click();
    cy.confirmarDialogo("Sí, cancelar reserva");
    cy.get(".swal2-validation-message").should("contain", "Escribe el motivo");
    cy.get(".swal2-textarea").type("La cancha estará en mantenimiento");
    cy.confirmarDialogo("Sí, cancelar reserva");
    cy.wait("@cancelar").its("request.body").should("deep.equal", { motivo: "La cancha estará en mantenimiento" });
    cy.dialogoDice("Reserva cancelada");
  });

  it("muestra el error del servidor al aprobar", () => {
    cy.intercept("PATCH", "**/api/reservas/deporte/rd1/confirmar", {
      statusCode: 409, body: { codigo: "CONFLICTO", error: "Solo se pueden aprobar reservas pendientes." },
    });
    cy.visitarComo("admin", ROUTES.gestionarReservasD);
    cy.contains("tr", "Laura Pérez").contains("button", "Aprobar").click();
    cy.confirmarDialogo("Sí, aprobar");
    cy.get(".swal2-validation-message").should("contain", "Solo se pueden aprobar reservas pendientes.");
  });
});

describe("Espacios deportivos (administrador)", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/espacios-deportivos", { body: espacios }).as("espacios");
  });

  it("crea un espacio nuevo", () => {
    cy.intercept("POST", "**/api/espacios-deportivos", { statusCode: 201, body: { ...espacios[0], id: "e3", nombre: "Cancha de Fútbol 5" } }).as("crear");
    cy.visitarComo("admin", ROUTES.espacios);
    cy.wait("@espacios");
    cy.contains("button", "Nuevo espacio").click();
    cy.get(".modal").should("be.visible").and("contain", "Nuevo espacio deportivo");
    cy.get("input[placeholder='Ej.: Cancha de Fútbol 1']").type("Cancha de Fútbol 5");
    cy.get("input[placeholder='Ej.: Fútbol']").type("Fútbol");
    cy.get("input[placeholder='50000']").type("80000");
    cy.get("input[placeholder='22']").type("10");
    cy.get(".modal").contains("button", "Crear espacio").click();
    cy.wait("@crear").its("request.body").should("deep.include", {
      nombre: "Cancha de Fútbol 5", deporte: "Fútbol", tarifaHora: 80000, capacidad: 10,
      horaApertura: "06:00", horaCierre: "22:00", estado: "ACTIVO",
    });
    cy.dialogoDice("Espacio creado");
  });

  it("edita la tarifa de un espacio", () => {
    cy.intercept("PUT", "**/api/espacios-deportivos/e1", { body: { ...espacios[0], tarifaHora: 45000 } }).as("editar");
    cy.visitarComo("admin", ROUTES.espacios);
    cy.contains(".ge-card", "Cancha de Tenis 1").contains("button", "Editar").click();
    cy.get("input[placeholder='50000']").clear().type("45000");
    cy.get(".modal").contains("button", "Guardar cambios").click();
    cy.wait("@editar").its("request.body").should("deep.include", { tarifaHora: 45000 });
    cy.dialogoDice("Espacio actualizado");
  });

  it("pone un espacio en mantenimiento desde su menú", () => {
    cy.intercept("PATCH", "**/api/espacios-deportivos/e1/estado*", { body: { ...espacios[0], estado: "MANTENIMIENTO" } }).as("estado");
    cy.visitarComo("admin", ROUTES.espacios);
    cy.contains(".ge-card", "Cancha de Tenis 1").find("button[aria-label='Más acciones']").click();
    cy.contains(".dropdown-item", "Mantenimiento").click();
    cy.wait("@estado").its("request.query").should("deep.include", { estado: "MANTENIMIENTO" });
  });

  it("valida que la hora de cierre sea posterior a la de apertura", () => {
    cy.visitarComo("admin", ROUTES.espacios);
    cy.contains("button", "Nuevo espacio").click();
    cy.get("input[placeholder='Ej.: Cancha de Fútbol 1']").type("Cancha nocturna");
    cy.get("input[placeholder='Ej.: Fútbol']").type("Fútbol");
    cy.get("input[placeholder='50000']").type("80000");
    cy.get("input[placeholder='22']").type("10");
    cy.get(".modal input[type=time]").last().type("05:00");
    cy.get(".modal").contains("button", "Crear espacio").click();
    cy.dialogoDice("Horario inválido");
  });
});
