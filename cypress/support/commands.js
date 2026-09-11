// ***********************************************
// Comandos personalizados de Golden Booking
// ***********************************************

Cypress.Commands.add("login", (username, password) => {
  // Visita explícita a la pantalla de login (puerto 5173, Vite dev server)
  cy.visit("http://localhost:5173/login");
  cy.get("#username").type(username);
  cy.get("#password").type(password);
  cy.get('button[type="submit"]').click();
});