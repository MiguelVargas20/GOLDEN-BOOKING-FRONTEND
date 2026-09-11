// Endpoints reales involucrados en este flujo (referencia rápida del swagger):
//   POST /auth/login                  -> cy.login()
//   GET  /api/contacto/no-leidos/count -> badge de notificaciones en Navbar
//   POST /api/contacto                -> enviarMensaje() en Contactos.jsx
//   GET  /api/contacto/mios           -> AdminMensajes.jsx (bandeja)

describe("Flujo de mensajería - Admin", () => {
  it("inicia sesión, envía un mensaje de contacto y lo ve en la bandeja de admin", () => {
    // 1. Login -> POST /auth/login
    cy.login("miguel1", "Miguelito123*");

    // 2. Sesión iniciada en Home, como ADMIN
    cy.url().should("include", "/home");
    cy.contains("Miguel Vargas").should("be.visible");
    cy.contains("ADMIN").should("be.visible");

    // 3. Ir a Contactanos
    cy.contains("Contactanos").click();
    cy.url().should("include", "/contactos");
    cy.contains("Ver Mensajes (Admin)").should("be.visible");

    // 4. Completar y enviar el mensaje -> POST /api/contacto
    const correo = `test.cypress.${Date.now()}@golden.com`;
    const mensaje = "Mensaje de prueba generado desde Cypress";

    cy.get(".input-field.correo").clear().type(correo);
    cy.get(".textarea-field.mensaje").clear().type(mensaje);
    cy.contains("button", "ENVIAR MENSAJE").click();

    // Confirmación SweetAlert2
    cy.get(".swal2-popup").should("be.visible");
    cy.contains("¡Mensaje enviado!").should("be.visible");

    // 5. Ir a la bandeja de mensajes (Admin) -> GET /api/contacto/mios
    cy.contains("Ver Mensajes (Admin)").click();
    cy.url().should("include", "/mensajes");
    cy.contains("BANDEJA DE").should("be.visible");
    cy.contains("MENSAJES").should("be.visible");

    // 6. El mensaje recién enviado debe verse en la bandeja
    cy.contains(mensaje).should("be.visible");
  });
});