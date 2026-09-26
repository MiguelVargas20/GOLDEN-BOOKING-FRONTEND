import { ROUTES } from "../support/routes.js";
import { configMembresia, miMembresia, socios } from "../support/datos.js";

describe("Miembros y socios (Ocasional y Miembro)", () => {
  describe("administrador", () => {
    beforeEach(() => {
      cy.simularApiBase("admin");
      cy.intercept("GET", "**/api/membresias/config", { body: configMembresia() }).as("config");
      cy.intercept("GET", "**/api/membresias/socios", { body: socios }).as("socios");
    });

    it("muestra a los clientes sugeridos y filtra", () => {
      cy.visitarComo("admin", ROUTES.socios);
      cy.wait("@socios");
      cy.contains("tr", "Laura Pérez").find(".so-sugerido").should("contain", "Sugerido");
      cy.contains("tr", "Pedro Gómez").should("contain", "Socio Miembro");
      cy.contains(".gb-chip", "Sugeridos").click();
      cy.get(".gb-tabla tbody tr").should("have.length", 1).and("contain", "Laura Pérez");
      cy.contains(".gb-chip", "Todos").click();
      cy.get("#so-buscar").type("4123");
      cy.get(".gb-tabla tbody tr").should("have.length", 1).and("contain", "Marta Ruiz");
    });

    it("guarda las reglas: número de reservas y beneficios por categoría", () => {
      cy.intercept("PUT", "**/api/membresias/config", { body: { ...configMembresia(), reservasParaSugerir: 8 } }).as("guardar");
      cy.visitarComo("admin", ROUTES.socios);
      cy.wait("@config");
      cy.get("#so-sugerir").clear().type("8");
      cy.get("#so-miembro-descuento").clear().type("15");
      cy.get("#so-ocasional-dias").clear().type("90");
      cy.contains("button", "Guardar reglas").click();
      cy.wait("@guardar").its("request.body").should("deep.include", {
        reservasParaSugerir: 8,
        miembro: { ...configMembresia().miembro, descuento: 15 },
        ocasional: { ...configMembresia().ocasional, diasAnticipacion: 90 },
      });
      cy.dialogoDice("Configuración guardada");
    });

    it("hace Socio Ocasional a un cliente sugerido", () => {
      cy.intercept("PATCH", "**/api/membresias/socios/c1?tipo=OCASIONAL", { body: { ...socios[0], membresia: "OCASIONAL", sugerido: false } }).as("asignar");
      cy.visitarComo("admin", ROUTES.socios);
      cy.contains("tr", "Laura Pérez").contains("button", "Ocasional").click();
      cy.confirmarDialogo("Sí, cambiar");
      cy.wait("@asignar");
      cy.dialogoDice("Membresía actualizada");
    });
  });

  describe("cliente", () => {
    beforeEach(() => cy.simularApiBase("cliente"));

    it("ve en su perfil cuánto le falta para ser socio", () => {
      cy.visitarComo("cliente", ROUTES.miPerfil);
      cy.get("[data-testid=mi-membresia]").should("contain", "Sin membresía")
        .and("contain", "Te faltan 2 reservas").and("contain", "Socio Ocasional").and("contain", "Socio Miembro");
    });

    it("el socio ve sus beneficios", () => {
      cy.intercept("GET", "**/api/membresias/mia", { body: miMembresia({ membresia: "MIEMBRO", descuento: 10, diasAnticipacion: 365, otrosBeneficios: "Parqueadero gratis" }) });
      cy.visitarComo("cliente", ROUTES.miPerfil);
      cy.get("[data-testid=mi-membresia]").should("contain", "Socio Miembro").and("contain", "10% de descuento")
        .and("contain", "365 días").and("contain", "Parqueadero gratis");
      cy.contains("a", "Ver mi cuenta de consumos").should("have.attr", "href", ROUTES.miCuenta);
    });
  });
});
