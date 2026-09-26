import { ROUTES } from "../support/routes.js";
import { habitaciones, pagina, tipos } from "../support/datos.js";

describe("Habitaciones (administrador)", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/tipohabitaciones", { body: tipos }).as("tipos");
    cy.intercept("GET", "**/api/habitaciones?*", { body: pagina(habitaciones) }).as("habitaciones");
  });

  it("crea una habitación con imagen y vuelve a Gestionar", () => {
    cy.intercept("POST", "**/api/habitaciones", { statusCode: 201, body: { ...habitaciones[0], id: "h9", numeroHabitacion: "402-A" } }).as("crear");
    cy.intercept("POST", "**/api/habitaciones/h9/imagen", { body: { ...habitaciones[0], id: "h9", imagenUrl: "/api/habitaciones/h9/imagen" } }).as("imagen");
    cy.visitarComo("admin", ROUTES.crearHabitacion);
    cy.wait("@tipos");
    cy.get("#hab-numero").type("402-A");
    cy.get("#hab-tipo").select("t2");
    cy.get("#hab-precio").type("210000");
    cy.get("#hab-desc").type("Vista a la piscina");
    cy.get(".gb-selector-imagen input[type=file]").selectFile("cypress/fixtures/habitacion.png", { force: true });
    cy.get(".gb-selector-imagen img").should("be.visible");
    cy.get(".ch-vista-previa").should("contain", "Habitación 402-A").and("contain", "210.000").and("contain", "Doble");
    cy.contains("button", "Registrar habitación").click();
    cy.wait("@crear").its("request.body").should("deep.equal", {
      numeroHabitacion: "402-A", datosTipoHabitacion: { id: "t2" }, precioNoche: 210000,
      estadoHabitacion: "DISPONIBLE", descripcion: "Vista a la piscina",
    });
    cy.wait("@imagen");
    cy.dialogoDice("Habitación registrada");
    cy.location("pathname").should("eq", ROUTES.gestionarHabitaciones);
  });

  it("rechaza una imagen demasiado pequeña antes de subirla", () => {
    cy.visitarComo("admin", ROUTES.crearHabitacion);
    cy.get(".gb-selector-imagen input[type=file]").selectFile("cypress/fixtures/imagen-pequena.png", { force: true });
    cy.get(".gb-selector-imagen").should("contain", "La imagen es muy pequeña");
  });

  it("valida el precio antes de enviar", () => {
    cy.visitarComo("admin", ROUTES.crearHabitacion);
    cy.wait("@tipos");
    cy.get("#hab-numero").type("500");
    cy.contains("button", "Registrar habitación").click();
    cy.contains("Ingresa un precio por noche mayor a cero.").should("be.visible");
  });

  it("edita el precio y el estado de una habitación", () => {
    cy.intercept("PUT", "**/api/habitaciones/h1", { body: { ...habitaciones[0], precioNoche: 200000 } }).as("editar");
    cy.visitarComo("admin", ROUTES.gestionarHabitaciones);
    cy.wait("@habitaciones");
    cy.contains("tr", "N.º 101").should("contain", "180.000").and("contain", "Suite");
    cy.contains("tr", "N.º 101").contains("button", "Editar").click();
    cy.get("#gh-precio").clear().type("200000");
    cy.get("#gh-estado").select("MANTENIMIENTO");
    cy.contains(".modal button", "Guardar").click();
    cy.wait("@editar").its("request.body").should("deep.include", { precioNoche: 200000, estadoHabitacion: "MANTENIMIENTO" });
    cy.dialogoDice("Habitación actualizada");
  });

  it("elimina una habitación después de confirmar", () => {
    cy.intercept("DELETE", "**/api/habitaciones/h2", { statusCode: 204 }).as("eliminar");
    cy.visitarComo("admin", ROUTES.gestionarHabitaciones);
    cy.get("button[aria-label='Eliminar habitación 102']").click();
    cy.dialogoDice("¿Eliminar habitación?");
    cy.confirmarDialogo("Sí, eliminar");
    cy.wait("@eliminar");
    cy.dialogoDice("Habitación eliminada");
  });
});

describe("Tipos de habitación (administrador)", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/tipohabitaciones", { body: tipos }).as("tipos");
  });

  it("crea un tipo nuevo", () => {
    cy.intercept("POST", "**/api/tipohabitaciones", { statusCode: 201, body: { id: "t3", nombreTipoHabitacion: "Familiar", capacidadMaxima: 5 } }).as("crear");
    cy.visitarComo("admin", ROUTES.tiposHabitacion);
    cy.wait("@tipos");
    cy.get(".gb-tabla tbody tr").should("have.length", 2);
    cy.get("#th-nombre").type("Familiar");
    cy.get("#th-capacidad").type("5");
    cy.get("#th-desc").type("Dos habitaciones conectadas");
    cy.contains("button", "Crear tipo").click();
    cy.wait("@crear").its("request.body").should("deep.equal", {
      nombreTipoHabitacion: "Familiar", descripcion: "Dos habitaciones conectadas", capacidadMaxima: 5,
    });
    cy.contains("¡Tipo de habitación creado con éxito!").should("be.visible");
  });

  it("edita un tipo existente", () => {
    cy.intercept("PUT", "**/api/tipohabitaciones/t1", { body: { ...tipos[0], capacidadMaxima: 3 } }).as("editar");
    cy.visitarComo("admin", ROUTES.tiposHabitacion);
    cy.contains("tr", "Suite").contains("button", "Editar").click();
    cy.get("#th-nombre").should("have.value", "Suite");
    cy.get("#th-capacidad").clear().type("3");
    cy.contains("button", "Guardar cambios").click();
    cy.wait("@editar").its("request.body").should("deep.include", { capacidadMaxima: 3 });
  });

  it("elimina un tipo después de confirmar", () => {
    cy.intercept("DELETE", "**/api/tipohabitaciones/t2", { statusCode: 204 }).as("eliminar");
    cy.visitarComo("admin", ROUTES.tiposHabitacion);
    cy.get("button[aria-label='Eliminar Doble']").click();
    cy.confirmarDialogo("Sí, eliminar");
    cy.wait("@eliminar");
    cy.dialogoDice("¡Eliminado!");
  });
});
