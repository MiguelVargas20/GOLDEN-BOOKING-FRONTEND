import { ROUTES } from "../support/routes";

// Endpoints reales involucrados en este flujo (referencia rápida del swagger):
//   POST /auth/login                                   -> cy.login()
//   GET  /api/habitaciones                              -> ReservasH.jsx (catálogo)
//   GET  /api/reservas/hotel/habitacion/{id}/ocupadas   -> ReservasH.jsx (por tarjeta) y DetalleHabitacion.jsx
//   GET  /api/habitaciones/{id}                         -> DetalleHabitacion.jsx
//   POST /api/reservas/hotel                            -> handleReservar() en DetalleHabitacion.jsx
//   GET  /api/reservas/hotel/mis-reservas                -> MisReservasHotel.jsx

describe("Flujo de reserva de hotel - Cliente", () => {
  const baseUrl = () => Cypress.config("baseUrl");

  const formatearFecha = (fecha) => {
    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const yyyy = fecha.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Fechas bien lejos en el futuro (año siguiente) para minimizar la
  // chance de chocar con reservas que ya existan en el ambiente de pruebas.
  const hoy = new Date();
  const checkIn = new Date(hoy.getFullYear() + 1, 5, 10);
  const checkOut = new Date(hoy.getFullYear() + 1, 5, 12);

  it("reserva una habitación disponible desde el detalle y la ve reflejada en Mis Reservas", () => {
    cy.intercept("GET", "**/api/habitaciones").as("getHabitaciones");
    cy.intercept("GET", "**/api/reservas/hotel/habitacion/*/ocupadas").as("getOcupadas");
    cy.intercept("GET", "**/api/habitaciones/*").as("getHabitacionPorId");
    cy.intercept("POST", "**/api/reservas/hotel").as("crearReservaHotel");
    cy.intercept("GET", "**/api/reservas/hotel/mis-reservas").as("getMisReservas");

    // 1. Login -> POST /auth/login
    cy.login("admin", "MiClaveSegura123!");
    cy.url().should("eq", `${baseUrl()}${ROUTES.home}`);

    // 2. Catálogo -> GET /api/habitaciones (+ ocupadas por cada tarjeta)
    cy.visitRoute("reservasHospedaje");
    cy.wait("@getHabitaciones");

    // 3. Elegimos la primera tarjeta "Disponible" (no en mantenimiento)
    //    y guardamos su número para reconocerla luego en Mis Reservas.
    cy.contains(".hotel-card-v2", "✓ Disponible").first().as("tarjetaElegida");

    cy.get("@tarjetaElegida")
      .find("h5")
      .invoke("text")
      .then((texto) => {
        cy.wrap(texto.split("·")[0].trim()).as("numeroHabitacion");
      });

    // 4. Detalle -> GET /api/habitaciones/{id}
    cy.get("@tarjetaElegida").contains("button", "Detalle").click();
    cy.url().should("include", "/detalle/");
    cy.wait("@getHabitacionPorId");

    // 5. Fechas escritas directo en los inputs (evitamos el portal del calendario)
    cy.get(".date-input-wrapper input").eq(0).clear().type(`${formatearFecha(checkIn)}{esc}`);
    cy.get(".date-input-wrapper input").eq(1).clear().type(`${formatearFecha(checkOut)}{esc}`);

    // 6. Reservar -> POST /api/reservas/hotel
    cy.contains("button", "Reservar Ahora").should("not.be.disabled").click();
    cy.get(".swal2-confirm").click(); // confirma el modal "¿Confirmar reserva?"
    cy.wait("@crearReservaHotel").its("response.statusCode").should("eq", 201);
    cy.contains("¡Reserva confirmada!").should("be.visible");

    // 7. Redirige a Mis Reservas -> GET /api/reservas/hotel/mis-reservas
    cy.url().should("eq", `${baseUrl()}${ROUTES.misReservasHotel}`);
    cy.wait("@getMisReservas");

    // 8. La reserva recién creada debe verse en la tabla
    cy.get("@numeroHabitacion").then((numero) => {
      cy.contains("td", numero).should("be.visible");
    });
  });
});