import { ROUTES } from "../support/routes.js";
import { cargo, cuentaCliente } from "../support/datos.js";

describe("Consumos: cargos a la reserva o a la cuenta de socio", () => {
  describe("administrador", () => {
    beforeEach(() => {
      cy.simularApiBase("admin");
      cy.intercept("GET", "**/api/cargos/pendientes", { body: [cargo()] }).as("pendientes");
    });

    it("busca al cliente y carga un bloqueador a su estadía", () => {
      cy.intercept("GET", "**/api/cargos/cuenta/52123456", { body: cuentaCliente() }).as("cuenta");
      cy.intercept("POST", "**/api/cargos", { statusCode: 201, body: cargo({ id: "cg2", concepto: "Bloqueador solar", total: 35000 }) }).as("cargar");
      cy.visitarComo("admin", ROUTES.consumos);
      cy.wait("@pendientes");
      cy.contains(".gb-tarjeta", "Pendientes de todos los clientes").should("contain", "Agua");

      cy.get("#cg-documento").type("52123456");
      cy.contains("button", "Buscar").click();
      cy.wait("@cuenta");
      cy.get(".cg-cliente").should("contain", "Laura Pérez").and("contain", "Socio Miembro");
      cy.get(".cg-pendiente").should("contain", "8.000");

      cy.contains(".gb-chip", "Bloqueador solar").click();
      cy.get("#cg-concepto").should("have.value", "Bloqueador solar");
      cy.get("#cg-valor").should("have.value", "35000");
      cy.get("#cg-destino").select("RESERVA_HOTEL|rh1");
      cy.contains("button", "Cargar consumo").click();
      cy.wait("@cargar").its("request.body").should("deep.include", {
        docUsuario: "52123456", concepto: "Bloqueador solar", categoria: "TIENDA", cantidad: 1,
        valorUnitario: 35000, destino: "RESERVA_HOTEL", idReserva: "rh1",
      });
      cy.dialogoDice("Consumo cargado");
    });

    it("carga a la cuenta de socio para pagar a fin de mes", () => {
      cy.intercept("GET", "**/api/cargos/cuenta/52123456", { body: cuentaCliente([]) });
      cy.intercept("POST", "**/api/cargos", { statusCode: 201, body: cargo({ destino: "CUENTA_SOCIO", idReserva: null }) }).as("cargar");
      cy.visitarComo("admin", ROUTES.consumos);
      cy.get("#cg-documento").type("52123456");
      cy.contains("button", "Buscar").click();
      cy.get("#cg-concepto").type("Almuerzo ejecutivo");
      cy.get("#cg-cantidad").clear().type("2");
      cy.get("#cg-valor").type("32500");
      cy.get(".cg-total").should("contain", "65.000");
      cy.get("#cg-destino").select("CUENTA_SOCIO|");
      cy.contains("button", "Cargar consumo").click();
      cy.wait("@cargar").its("request.body").should("deep.include", { destino: "CUENTA_SOCIO", idReserva: null, cantidad: 2, valorUnitario: 32500 });
    });

    it("cobra al check-out solo lo cargado a la estadía", () => {
      cy.intercept("GET", "**/api/cargos/cuenta/52123456", {
        body: cuentaCliente([cargo(), cargo({ id: "cg3", concepto: "Almuerzo", total: 35000, destino: "CUENTA_SOCIO", idReserva: null })]),
      });
      cy.intercept("PATCH", "**/api/cargos/cuenta/52123456/pagar?*", { body: { cantidad: 1, total: 8000 } }).as("cobrar");
      cy.visitarComo("admin", ROUTES.consumos);
      cy.get("#cg-documento").type("52123456");
      cy.contains("button", "Buscar").click();
      cy.get(".cg-pendiente").should("contain", "43.000");
      cy.contains("button", "Cobrar check-out").click();
      cy.confirmarDialogo("Sí, registrar pago");
      cy.wait("@cobrar").its("request.url").should("contain", "idReserva=rh1");
      cy.dialogoDice("Pago registrado");
    });

    it("avisa si el cliente no existe", () => {
      cy.intercept("GET", "**/api/cargos/cuenta/999", { statusCode: 404, body: { error: "No hay ningún cliente con el documento 999." } });
      cy.visitarComo("admin", ROUTES.consumos);
      cy.get("#cg-documento").type("999");
      cy.contains("button", "Buscar").click();
      cy.get(".alert-danger").should("contain", "No hay ningún cliente con el documento 999.");
    });
  });

  it("el cliente ve lo que tiene pendiente en Mi cuenta", () => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/cargos/mios", {
      body: cuentaCliente([cargo(), cargo({ id: "cg4", concepto: "Masaje", total: 120000, estado: "PAGADO", fechaPago: "2026-09-01T10:00:00" })]),
    });
    cy.visitarComo("cliente", ROUTES.miCuenta);
    cy.get(".cg-pendiente").should("contain", "8.000");
    cy.contains(".cg-lista li", "Agua").should("contain", "8.000");
    cy.contains(".cg-lista li", "Masaje").should("exist");
  });
});
