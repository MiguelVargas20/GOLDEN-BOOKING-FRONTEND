import { ROUTES } from "../support/routes";

// Endpoints reales involucrados en este flujo (referencia rápida del swagger):
//   POST /auth/login                    -> cy.login()
//   GET  /api/habitaciones               -> ReservasH.jsx (catálogo)
//   GET  /api/tipohabitaciones           -> HabitacionD.jsx (select de tipos)
//   POST /api/habitaciones               -> crearHabitacion() al Finalizar Registro
//   GET  /api/habitaciones (paginado)    -> GestionHabitacionesD.jsx (tabla)

describe("Gestión de Habitaciones - Crear", () => {
  const baseUrl = () => Cypress.config("baseUrl");
  const numeroHabitacion = "104";

  const campoPorEtiqueta = (textoEtiqueta) =>
    cy.contains("p", textoEtiqueta).parent();

  it("crea una habitación como Admin y verifica que aparece en Gestionar", () => {
    // Interceptamos las llamadas clave para esperar por RED, no por timing.
    cy.intercept("GET", "**/api/tipohabitaciones").as("getTipos");
    cy.intercept("POST", "**/api/habitaciones").as("crearHabitacion");

    // 1. Login -> POST /auth/login
    cy.login("admin", "MiClaveSegura123!");
    cy.url().should("eq", `${baseUrl()}${ROUTES.home}`);
    cy.contains("ADMIN").should("be.visible");

    // 2. Servicios -> Reservas Hoteleras
    cy.contains("Servicios").click();
    cy.contains("Reservas Hoteleras").click();
    cy.url().should("eq", `${baseUrl()}${ROUTES.reservasHospedaje}`);

    // 3. Crear (solo visible para Admin)
    cy.contains("button", "Crear").click();
    cy.url().should("eq", `${baseUrl()}${ROUTES.crearHabitacion}`);

    // Esperamos a que el formulario termine de traer los tipos ANTES
    // de tocar cualquier select — elimina la carrera que nos dio problemas.
    cy.wait("@getTipos");

    // 4. Número de habitación
    campoPorEtiqueta("Número de Habitación").find("input").type(numeroHabitacion);

    // 5. Tipo de habitación (aleatorio entre los disponibles)
    campoPorEtiqueta("Tipo de Habitación")
      .find("select")
      .should("be.visible")
      .then(($select) => {
        const opciones = $select.find("option");
        const indiceAleatorio = Cypress._.random(1, opciones.length - 1);
        const valor = opciones.eq(indiceAleatorio).val();
        cy.wrap($select).select(valor);
      });

    // 6. Precio por noche
    campoPorEtiqueta("Precio por Noche").find("input").type("250000");

    // 7. Estado: Disponible (confirmamos que la opción existe antes de elegirla)
    campoPorEtiqueta("Estado de la Habitación")
      .find("select") 
    campoPorEtiqueta("Estado de la Habitación").find("select").select("Disponible");

    // 8. Finalizar Registro -> POST /api/habitaciones
    //    Nos aseguramos de que el botón esté habilitado antes de hacer clic.
    cy.contains("button", "Finalizar Registro").should("not.be.disabled").click();
    cy.wait("@crearHabitacion").its("response.statusCode").should("eq", 201);
    cy.contains("¡Habitación registrada con éxito!").should("be.visible");

    // 9. Redirige de vuelta a Reservas Hoteleras
    cy.url().should("eq", `${baseUrl()}${ROUTES.reservasHospedaje}`);

    // 10. Gestionar -> ver el listado administrativo
    cy.contains("Gestionar").click();
    cy.url().should("eq", `${baseUrl()}${ROUTES.gestionarHabitaciones}`);

    // 11. Verificar que la habitación quedó creada (recorre páginas si hace falta)
    cy.buscarEnTablaPaginada(numeroHabitacion);
  });
});