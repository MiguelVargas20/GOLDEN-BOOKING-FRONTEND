import { ROUTES } from "../support/routes.js";
import { perfil } from "../support/datos.js";

describe("Mi perfil", () => {
  beforeEach(() => cy.simularApiBase("cliente"));

  it("muestra los datos actuales y el documento solo de lectura", () => {
    cy.visitarComo("cliente", ROUTES.miPerfil);
    cy.wait("@perfil");
    cy.get(".mp-resumen").should("contain", "Laura Pérez").and("contain", "Cédula de ciudadanía 52123456").and("contain", "Cliente");
    cy.get("#mp-correo").should("have.value", "laura@correo.com");
    cy.get("#mp-ciudad").should("have.value", "Bogotá");
    cy.get("#mp-fechaNacimiento").should("have.value", "1995-05-10");
  });

  it("guarda los cambios de contacto y dirección", () => {
    cy.intercept("PATCH", "**/api/usuarios/perfil/c1", { body: { ...perfil("cliente"), telefono: "3150000000" } }).as("guardar");
    cy.visitarComo("cliente", ROUTES.miPerfil);
    cy.get("#mp-telefono").clear().type("3150000000");
    cy.get("#mp-ciudad").clear().type("Cartagena");
    cy.contains("button", "Guardar cambios").click();
    cy.wait("@guardar").its("request.body").should("deep.include", {
      nombre: "Laura", telefono: "3150000000", ciudad: "Cartagena", correo: "laura@correo.com", fechaNacimiento: "1995-05-10",
    });
    cy.dialogoDice("Perfil actualizado");
  });

  it("muestra el error del servidor (correo repetido)", () => {
    cy.intercept("PATCH", "**/api/usuarios/perfil/c1", {
      statusCode: 409, body: { codigo: "CONFLICTO", error: "Ese correo ya está registrado." },
    });
    cy.visitarComo("cliente", ROUTES.miPerfil);
    cy.get("#mp-correo").clear().type("otro@correo.com");
    cy.contains("button", "Guardar cambios").click();
    cy.get(".alert-danger").should("contain", "Ese correo ya está registrado.");
  });
});
