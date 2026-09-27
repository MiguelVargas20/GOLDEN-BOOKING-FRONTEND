import { ROUTES } from "../support/routes.js";
import { aDMY, enDias, evento } from "../support/datos.js";

describe("Eventos del club", () => {
  it("el cliente ve los próximos eventos arriba en el Inicio, con la insignia Nuevo", () => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/eventos/proximos", {
      body: [evento(), evento({ id: "ev2", titulo: "Festival de verano", categoria: "FESTIVAL", nuevo: false, precio: 25000 })],
    });
    cy.visitarComo("cliente", ROUTES.home);
    cy.contains("h2", "PRÓXIMOS EVENTOS").should("be.visible");
    cy.contains(".ev-card", "Noche de salsa").should("contain", "Baile").and("contain", "Entrada libre").find(".ev-nuevo").should("exist");
    cy.contains(".ev-card", "Festival de verano").should("contain", "25.000").find(".ev-nuevo").should("not.exist");
    cy.contains("a", "Ver todos los eventos").click();
    cy.location("pathname").should("eq", ROUTES.eventos);
  });

  it("sin eventos publicados la sección no aparece", () => {
    cy.simularApiBase("cliente");
    cy.visitarComo("cliente", ROUTES.home);
    cy.contains("h2", "RESERVAS ESPACIOS").should("be.visible");
    cy.contains("PRÓXIMOS EVENTOS").should("not.exist");
  });

  it("la agenda del cliente filtra por categoría", () => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/eventos/proximos", {
      body: [evento(), evento({ id: "ev2", titulo: "Festival de verano", categoria: "FESTIVAL" })],
    });
    cy.visitarComo("cliente", ROUTES.eventos);
    cy.get(".ev-card").should("have.length", 2);
    cy.contains(".gb-chip", "Festival").click();
    cy.get(".ev-card").should("have.length", 1).and("contain", "Festival de verano");
  });

  describe("administrador", () => {
    beforeEach(() => cy.simularApiBase("admin"));

    it("crea un evento publicado con el calendario de la app", () => {
      const dia = enDias(15);
      cy.intercept("GET", "**/api/eventos", { body: [evento({ publicado: false, titulo: "Borrador de karaoke" })] }).as("lista");
      cy.intercept("POST", "**/api/eventos", { statusCode: 201, body: evento({ id: "ev9", titulo: "Tarde recreativa" }) }).as("crear");
      cy.visitarComo("admin", ROUTES.gestionarEventos);
      cy.wait("@lista");
      cy.contains(".ev-admin-card", "Borrador de karaoke").find(".ev-borrador").should("contain", "Borrador");

      cy.contains("button", "Nuevo evento").click();
      cy.get("#ev-titulo").type("Tarde recreativa");
      cy.get("#ev-categoria").select("RECREATIVO");
      cy.get("#ev-lugar").type("Zona verde");
      cy.get("#ev-dia-inicio").click();
      cy.get(".gb-calendario").should("be.visible");
      cy.get("#ev-dia-inicio").type(`${aDMY(dia)}{enter}`);
      cy.get("#ev-hora-inicio").clear().type("15:00");
      cy.get("#ev-hora-fin").clear().type("18:30");
      cy.get("#ev-cupo").type("40");
      cy.get("#ev-precio").type("12500");
      cy.contains("button", "Crear evento").click();
      cy.wait("@crear").its("request.body").should("deep.include", {
        titulo: "Tarde recreativa", categoria: "RECREATIVO", lugar: "Zona verde",
        fechaInicio: `${dia}T15:00:00`, fechaFin: `${dia}T18:30:00`, cupo: 40, precio: 12500, publicado: true,
      });
      cy.dialogoDice("Evento creado");
    });

    it("no deja guardar un evento que termina antes de empezar", () => {
      cy.intercept("GET", "**/api/eventos", { body: [] });
      cy.visitarComo("admin", ROUTES.gestionarEventos);
      cy.contains("button", "Nuevo evento").click();
      cy.get("#ev-titulo").type("Mal horario");
      cy.get("#ev-lugar").type("Salón");
      cy.get("#ev-dia-inicio").type(`${aDMY(enDias(5))}{enter}`);
      cy.get("#ev-hora-inicio").clear().type("20:00");
      cy.get("#ev-hora-fin").clear().type("18:00");
      cy.contains("button", "Crear evento").click();
      cy.dialogoDice("Revisa las fechas");
    });

    it("elimina un evento", () => {
      cy.intercept("GET", "**/api/eventos", { body: [evento()] });
      cy.intercept("DELETE", "**/api/eventos/ev1", { statusCode: 204 }).as("eliminar");
      cy.visitarComo("admin", ROUTES.gestionarEventos);
      cy.get("button[aria-label='Eliminar Noche de salsa']").click();
      cy.confirmarDialogo("Sí, eliminar");
      cy.wait("@eliminar");
    });
  });
});
