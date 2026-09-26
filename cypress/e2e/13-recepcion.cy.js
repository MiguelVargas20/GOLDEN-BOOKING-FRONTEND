import { ROUTES } from "../support/routes.js";
import { aDMY, enDias, espacios, habitaciones, pagina, reservaHotel, usuariosLista } from "../support/datos.js";

describe("Recepción: reservar a nombre de un cliente", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/espacios-deportivos", { body: espacios });
    cy.intercept("GET", "**/api/habitaciones?*", { body: pagina(habitaciones) });
    cy.intercept("GET", "**/api/reservas/hotel/habitacion/*/ocupadas", { body: [] });
    cy.intercept("GET", "**/api/reservas/hotel?*", { body: pagina([]) });
  });

  it("avisa si no existe un cliente con ese documento", () => {
    cy.intercept("GET", "**/api/usuarios/doc/999999", { statusCode: 404, body: { codigo: "NO_ENCONTRADO", error: "No hay un usuario con ese documento." } });
    cy.visitarComo("admin", `${ROUTES.recepcion}?tipo=hotel`);
    cy.get("input[placeholder='Número de documento del cliente']").type("999999");
    cy.contains("button", "Buscar").click();
    cy.contains("No hay ningún cliente registrado con ese documento.").should("be.visible");
    cy.contains("button", "Registrar reserva").should("be.disabled");
  });

  it("registra una estadía confirmada de inmediato para el cliente", () => {
    const entrada = enDias(30);
    const salida = enDias(33);
    cy.intercept("GET", "**/api/usuarios/doc/52123456", { body: usuariosLista[1] }).as("cliente");
    cy.intercept("POST", "**/api/reservas/hotel?confirmar=true", { statusCode: 201, body: reservaHotel({ estado: "CONFIRMADA" }) }).as("crear");
    cy.visitarComo("admin", `${ROUTES.recepcion}?tipo=hotel`);
    cy.get("input[placeholder='Número de documento del cliente']").type("52123456");
    cy.contains("button", "Buscar").click();
    cy.wait("@cliente");
    cy.contains("Laura Pérez").should("be.visible");

    cy.get("select").select("h1");
    cy.get("input[placeholder='dd/mm/aaaa']").first().type(`${aDMY(entrada)}{enter}`);
    cy.get("input[placeholder='dd/mm/aaaa']").last().type(`${aDMY(salida)}{enter}`);
    cy.get("#nr-confirmar").check();
    cy.contains("button", "Registrar reserva").click();
    cy.dialogoDice("¿Registrar la reserva?");
    cy.get(".swal2-popup").should("contain", "3 noches").and("contain", "540.000");
    cy.confirmarDialogo("Sí, registrar");
    cy.wait("@crear").its("request.body").should("deep.include", {
      idHabitacion: "h1", docUsuario: "52123456", fCheckIn: `${entrada}T00:00:00`, fCheckOut: `${salida}T00:00:00`,
    });
    cy.dialogoDice("Reserva registrada");
    cy.confirmarDialogo("OK");
    cy.location("pathname").should("eq", ROUTES.gestionarReservasHotel);
  });

  it("no deja registrar reservas a un cliente inactivo", () => {
    cy.intercept("GET", "**/api/usuarios/doc/52123456", { body: { ...usuariosLista[1], estado: "INACTIVO" } });
    cy.visitarComo("admin", `${ROUTES.recepcion}?tipo=deporte`);
    cy.get("input[placeholder='Número de documento del cliente']").type("52123456");
    cy.contains("button", "Buscar").click();
    cy.contains("Cuenta inactiva: no se pueden registrar reservas a su nombre.").should("be.visible");
    cy.contains("button", "Registrar reserva").should("be.disabled");
  });
});
