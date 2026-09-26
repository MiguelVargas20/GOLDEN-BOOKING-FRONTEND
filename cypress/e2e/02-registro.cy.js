import { ROUTES } from "../support/routes.js";

const llenarFormulario = (datos = {}) => {
  const d = {
    nombre: "Laura", apellido: "Pérez", numeroDoc: "52123456", fechaNacimiento: "1995-05-10",
    email: "laura@correo.com", telefono: "3109876543", calle: "Calle 45", carrera: "Carrera 12",
    ciudad: "Bogotá", username: "laurap", password: "Segura123", confirmarPassword: "Segura123",
    ...datos,
  };
  for (const [campo, valor] of Object.entries(d)) cy.get(`#rg-${campo}`).type(valor);
};

describe("Registro de clientes", () => {
  it("marca los campos obligatorios y las reglas de la contraseña", () => {
    cy.visit(ROUTES.registro);
    cy.contains("button", "Crear cuenta").click();
    cy.get("#rg-nombre").should("have.attr", "aria-invalid", "true");
    cy.get("#rg-email").should("have.attr", "aria-invalid", "true");
    cy.get("#rg-password").type("corta");
    cy.contains("button", "Crear cuenta").click();
    cy.contains(".rg-error", "Mínimo 8 caracteres").should("be.visible");
  });

  it("avisa si las contraseñas no coinciden", () => {
    cy.visit(ROUTES.registro);
    llenarFormulario({ confirmarPassword: "Otra1234" });
    cy.contains("button", "Crear cuenta").click();
    cy.contains(".rg-error", "Las contraseñas no coinciden").should("be.visible");
  });

  it("crea la cuenta con todos los datos y vuelve al login", () => {
    cy.intercept("POST", "**/api/usuarios/registro", { statusCode: 201, body: { id: "c9" } }).as("registro");
    cy.visit(ROUTES.registro);
    cy.get("#rg-tipoDoc").select("CE");
    llenarFormulario();
    cy.contains("button", "Crear cuenta").click();
    cy.wait("@registro").its("request.body").should("deep.include", {
      nombre: "Laura",
      apellido: "Pérez",
      documento: { tipo: "CE", numeroD: "52123456" },
      fechaNacimiento: "1995-05-10",
      direccion: { cll: "Calle 45", crr: "Carrera 12", cd: "Bogotá", ps: "Colombia" },
      email: "laura@correo.com",
      username: "laurap",
    });
    cy.dialogoDice("¡Cuenta creada!");
    cy.confirmarDialogo("OK");
    cy.location("pathname").should("eq", ROUTES.login);
  });

  it("muestra el error del servidor (usuario repetido)", () => {
    cy.intercept("POST", "**/api/usuarios/registro", {
      statusCode: 409, body: { codigo: "CONFLICTO", error: "El nombre de usuario ya está en uso." },
    }).as("registro");
    cy.visit(ROUTES.registro);
    llenarFormulario();
    cy.contains("button", "Crear cuenta").click();
    cy.wait("@registro");
    cy.get(".rg-error-servidor").should("contain", "El nombre de usuario ya está en uso.");
  });
});
