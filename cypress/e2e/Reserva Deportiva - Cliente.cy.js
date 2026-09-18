import { ROUTES } from "../support/routes";

// Endpoints reales involucrados en este flujo:
//   POST /auth/login                          -> cy.login()
//   POST /api/reservas/deporte                -> handleSubmit() en ReservarEspacioD.jsx
//   GET  /api/reservas/deporte (paginado)      -> GestionarReservas.jsx (vista ADMIN)
//   GET  /api/reservas/deporte/mis-reservas    -> ReservasDSolicitadas.jsx (vista propia)
//   PATCH /api/reservas/deporte/{id}/cancelar  -> handleCancelar() en ambas tablas

describe("Flujo de reserva deportiva - Admin", () => {
  const baseUrl = () => Cypress.config("baseUrl");
  const cancha = "Tennis"; // debe coincidir con un "title" de ReservasDCatalogo.jsx

  it("crea una reserva deportiva, la ve en Gestionar y en Mis Reservas, y la cancela", () => {
    cy.intercept("POST", "**/api/reservas/deporte").as("crearReservaDeporte");
    cy.intercept("GET", "**/api/reservas/deporte?*").as("getReservasDeportePaginado");
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas").as("getMisReservasDeporte");
    cy.intercept("PATCH", "**/api/reservas/deporte/*/cancelar").as("cancelarReservaDeporte");

    // 1. Login -> POST /auth/login
    cy.login("admin", "MiClaveSegura123!");
    cy.url().should("eq", `${baseUrl()}${ROUTES.home}`);

    // 2. Catálogo estático -> clic en una cancha (sin GET, navega con state de router)
    cy.visitRoute("reservasDeportivas");
    cy.contains(".facility-card", cancha).click();
    cy.url().should("include", ROUTES.reservarEspacioD);

    // 3. Elegir fecha de ENTRADA: abrir el picker y hacer clic en "hoy + 2 días"
    const fechaEntrada = new Date();
    fechaEntrada.setDate(fechaEntrada.getDate() + 2);
    const diaEntrada = fechaEntrada.getDate();

    cy.get(".date-input-wrapper").eq(0).find("input").click();
    cy.get(".react-datepicker__day")
      .not(".react-datepicker__day--outside-month")
      .contains(new RegExp(`^${diaEntrada}$`))
      .click();
    // Al elegir el día se abre la lista de horarios; tomamos el primero disponible.
    cy.get(".react-datepicker__time-list-item").not(".react-datepicker__time-list-item--disabled").first().click();

    // 4. Elegir fecha de SALIDA: mismo día, un horario más adelante en la lista
    cy.get(".date-input-wrapper").eq(1).find("input").click();
    cy.get(".react-datepicker__day")
      .not(".react-datepicker__day--outside-month")
      .contains(new RegExp(`^${diaEntrada}$`))
      .click();
    cy.get(".react-datepicker__time-list-item").not(".react-datepicker__time-list-item--disabled").eq(2).click();

    // 5. Confirmar reserva -> POST /api/reservas/deporte
    cy.contains("button", "CONFIRMAR RESERVA").should("not.be.disabled").click();
    cy.get(".swal2-confirm").click();
    cy.wait("@crearReservaDeporte").its("response.statusCode").should("eq", 201);
    cy.contains("¡Reserva confirmada!").should("be.visible");

    // 6. Como es ADMIN, redirige a Gestionar -> GET paginado
    cy.url().should("eq", `${baseUrl()}${ROUTES.gestionarReservasD}`);
    cy.wait("@getReservasDeportePaginado");
    cy.buscarEnTablaPaginada(cancha);

    // 7. Verificar también en Mis Reservas (vista propia) -> GET mis-reservas
    cy.visitRoute("misReservasDeporte");
    cy.wait("@getMisReservasDeporte");
    cy.contains(".mis-reservas-badge", cancha).should("be.visible");

    // 8. Cancelar desde Mis Reservas -> PATCH .../cancelar
    cy.contains("tr", cancha).within(() => {
      cy.contains("button", "Cancelar").click();
    });
    cy.get(".swal2-confirm").click();
    cy.wait("@cancelarReservaDeporte");
    cy.contains("¡Reserva cancelada!").should("be.visible");

    // 9. La tabla se refresca sola (obtenerMisReservas() en el then) -> confirmar estado CANCELADA
    cy.wait("@getMisReservasDeporte");
    cy.contains("tr", cancha).find(".mis-reservas-estado").should("contain.text", "CANCELADA");
  });
});