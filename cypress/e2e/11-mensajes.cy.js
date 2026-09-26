import { ROUTES } from "../support/routes.js";
import { mensaje, pagina } from "../support/datos.js";

describe("Mensajes de contacto", () => {
  it("el cliente envía un mensaje desde Contáctanos", () => {
    cy.simularApiBase("cliente");
    cy.intercept("POST", "**/api/contacto", { statusCode: 201, body: mensaje() }).as("enviar");
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.get("#ct-nombre").should("have.value", "Laura Pérez");
    cy.get("#ct-correo").type("laura@correo.com");
    cy.get("#ct-mensaje").type("¿Tienen parqueadero para huéspedes?");
    cy.contains("button", "Enviar mensaje").click();
    cy.wait("@enviar").its("request.body").should("deep.include", {
      nombre: "Laura Pérez", correo: "laura@correo.com", contenido: "¿Tienen parqueadero para huéspedes?",
    });
    cy.dialogoDice("¡Mensaje enviado!");
  });

  it("valida el correo y el largo del mensaje", () => {
    cy.simularApiBase("cliente");
    cy.visitarComo("cliente", ROUTES.contactos);
    cy.get("#ct-correo").type("correo-malo");
    cy.get("#ct-mensaje").type("Hola");
    cy.contains("button", "Enviar mensaje").click();
    cy.dialogoDice("Correo inválido");
  });

  it("el cliente ve la respuesta del administrador y se marca como vista", () => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/contacto/mios?*", {
      body: pagina([mensaje({ respuesta: "Sí, es gratis para huéspedes.", respuestaVista: false, fechaRespuesta: "2026-09-20T10:00:00" })]),
    });
    cy.intercept("PATCH", "**/api/contacto/m1/respuesta-vista", { body: { respuestaVista: true } }).as("vista");
    cy.visitarComo("cliente", ROUTES.misMensajes);
    cy.contains(".mensaje-card", "Sí, es gratis para huéspedes.").should("contain", "Nueva respuesta").click();
    cy.wait("@vista");
    cy.contains("Nueva respuesta").should("not.exist");
  });

  it("el administrador responde un mensaje de la bandeja", () => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/contacto?*", { body: pagina([mensaje(), mensaje({ id: "m2", nombre: "Pedro Gómez", leido: true, respuesta: "Listo" })]) }).as("bandeja");
    cy.intercept("PATCH", "**/api/contacto/m1/responder", { body: mensaje({ leido: true, respuesta: "Sí, es gratis." }) }).as("responder");
    cy.visitarComo("admin", ROUTES.mensajes);
    cy.wait("@bandeja");
    cy.contains(".mensaje-card", "Laura Pérez").should("contain", "Nuevo").and("contain", "Pendiente");
    cy.contains(".mensaje-card", "Pedro Gómez").should("contain", "Respondido");
    cy.contains(".mensaje-card", "Laura Pérez").contains("button", "Responder").click();
    cy.get("textarea[placeholder='Escribe tu respuesta para Laura Pérez...']").type("Sí, es gratis.");
    cy.contains("button", "Enviar respuesta").click();
    cy.wait("@responder").its("request.body").should("deep.include", { respuesta: "Sí, es gratis." });
    cy.dialogoDice("Respuesta enviada");
  });

  it("el administrador filtra solo los no leídos", () => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/contacto?*", { body: pagina([mensaje(), mensaje({ id: "m2", nombre: "Pedro Gómez", leido: true })]) });
    cy.visitarComo("admin", ROUTES.mensajes);
    cy.get(".mensaje-card").should("have.length", 2);
    cy.get("#filtro-no-leidos").check();
    cy.get(".mensaje-card").should("have.length", 1).and("contain", "Laura Pérez");
  });
});
