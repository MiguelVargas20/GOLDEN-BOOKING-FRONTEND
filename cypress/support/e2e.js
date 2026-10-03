// Se carga antes de cada spec: registra los comandos propios del proyecto.
import "./commands.js";

// El aviso "Despertando el servidor" consulta /actuator/health al abrir las
// pantallas de acceso: en las pruebas el backend simulado siempre está despierto.
beforeEach(() => {
  cy.intercept("GET", "**/actuator/health", { body: { status: "UP" } });
});
