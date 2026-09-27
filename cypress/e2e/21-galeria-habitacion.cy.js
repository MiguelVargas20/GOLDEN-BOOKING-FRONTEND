import { ROUTES } from "../support/routes.js";
import { habitaciones, pagina, tipos } from "../support/datos.js";

const fotos = (n) => Array.from({ length: n }, (_, i) => ({ id: `i${i + 1}`, url: `/api/habitaciones/h1/imagenes/i${i + 1}` }));
const conFotos = (n) => ({ ...habitaciones[0], imagenUrl: n ? "/api/habitaciones/h1/imagenes/i1" : null, imagenes: fotos(n) });

describe("Galería de la habitación (hasta 5 fotos)", () => {
  it("el cliente ve las fotos en un carrusel", () => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/habitaciones/h1", { body: conFotos(3) });
    cy.intercept("GET", "**/api/reservas/hotel/habitacion/*/ocupadas", { body: [] });
    cy.visitarComo("cliente", "/habitaciones/h1");
    cy.get(".dh-carrusel .carousel-item").should("have.length", 3);
    cy.get(".dh-carrusel .carousel-control-next").should("exist");
  });

  describe("administrador", () => {
    beforeEach(() => {
      cy.simularApiBase("admin");
      cy.intercept("GET", "**/api/tipohabitaciones", { body: tipos });
      cy.intercept("GET", "**/api/habitaciones?*", { body: pagina([conFotos(2), habitaciones[1]]) });
    });

    it("agrega una foto, elige la portada y quita otra", () => {
      cy.intercept("POST", "**/api/habitaciones/h1/imagenes", { body: conFotos(3) }).as("agregar");
      cy.intercept("PATCH", "**/api/habitaciones/h1/imagenes/i3/portada", {
        body: { ...conFotos(3), imagenes: [fotos(3)[2], fotos(3)[0], fotos(3)[1]] },
      }).as("portada");
      cy.intercept("DELETE", "**/api/habitaciones/h1/imagenes/i2", { body: { ...conFotos(2), imagenes: [fotos(3)[2], fotos(3)[0]] } }).as("quitar");
      cy.visitarComo("admin", ROUTES.gestionarHabitaciones);
      cy.contains("tr", "N.º 101").contains("button", "Editar").click();
      cy.get(".gal-grilla img").should("have.length", 2);
      cy.get(".gal input[type=file]").selectFile("cypress/fixtures/habitacion.png", { force: true });
      cy.wait("@agregar");
      cy.get(".gal-grilla img").should("have.length", 3);
      cy.get("button[aria-label='Usar la foto 3 como portada']").click();
      cy.wait("@portada");
      cy.get(".gal-foto.portada img[src$='/i3']").should("exist");
      cy.get("button[aria-label='Quitar la foto 3']").click();
      cy.wait("@quitar");
      cy.get(".gal-grilla img").should("have.length", 2);
    });

    it("con 5 fotos ya no deja agregar más", () => {
      cy.intercept("GET", "**/api/habitaciones?*", { body: pagina([conFotos(5)]) });
      cy.visitarComo("admin", ROUTES.gestionarHabitaciones);
      cy.contains("tr", "N.º 101").contains("button", "Editar").click();
      cy.get(".gal-grilla img").should("have.length", 5);
      cy.get(".gal-agregar").should("not.exist");
    });
  });
});
