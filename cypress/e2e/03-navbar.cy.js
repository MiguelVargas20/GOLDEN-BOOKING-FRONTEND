import { ROUTES } from "../support/routes.js";

describe("Menú de navegación", () => {
  it("el administrador ve la gestión y el menú de Usuarios", () => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/reservas/deporte/resumen", { body: { PENDIENTE: 2 } });
    cy.intercept("GET", "**/api/reservas/hotel/resumen", { body: { PENDIENTE: 1 } });
    cy.intercept("GET", "**/api/contacto", { body: [] });
    cy.visitarComo("admin", ROUTES.contactos);
    cy.get("nav").contains("Usuarios").should("be.visible");
    cy.get("nav").contains("Servicios").click();
    cy.contains(".dropdown-menu", "Gestionar habitaciones").should("be.visible");
    cy.get(".dropdown-menu").contains("Administrar espacios").should("be.visible");
    cy.get(".dropdown-menu").contains("Tipos de habitación").click();
    cy.location("pathname").should("eq", ROUTES.tiposHabitacion);
    cy.get(".dropdown-menu").should("not.be.visible");
  });

  it("el cliente no ve las opciones de administración", () => {
    cy.simularApiBase("cliente");
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.contains("CLIENTE").should("be.visible");
    cy.get("nav").contains("Usuarios").should("not.exist");
    cy.get("nav").contains("Servicios").click();
    cy.get(".dropdown-menu").contains("Ver habitaciones").should("be.visible");
    cy.get(".dropdown-menu").contains("Gestionar reservas").should("not.exist");
    cy.get(".dropdown-menu").contains("Mis reservas").first().click();
    cy.location("pathname").should("eq", ROUTES.misReservasDeporte);
  });

  it("la campana del cliente suma las respuestas nuevas y abre Mis mensajes", () => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/contacto/mios/no-vistas/count", { body: { noVistas: 3 } });
    cy.intercept("GET", "**/api/contacto/mios?*", { body: { contenido: [], paginaActual: 0, totalPaginas: 0, totalElementos: 0 } });
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.get("button[aria-label='Notificaciones']").should("contain", "3").click();
    cy.contains(".cn-item", "Tienes 3 respuestas nuevas").click();
    cy.location("pathname").should("eq", ROUTES.misMensajes);
  });

  it("cierra la sesión", () => {
    cy.simularApiBase("cliente");
    cy.intercept("POST", "**/auth/logout", { statusCode: 204 }).as("logout");
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.get("button[title='Cerrar sesión']").click();
    cy.dialogoDice("¿Cerrar sesión?");
    cy.confirmarDialogo("Sí, salir");
    cy.wait("@logout");
    cy.location("pathname").should("eq", ROUTES.login);
  });
});
