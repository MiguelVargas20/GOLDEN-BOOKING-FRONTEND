import { ROUTES } from "../support/routes.js";
import { perfil, tokenFalso } from "../support/datos.js";

describe("Inicio de sesión", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/dashboard*", { body: {} });
  });

  it("valida los campos vacíos antes de llamar al servidor", () => {
    cy.visit(ROUTES.login);
    cy.contains("button", "Ingresar").click();
    cy.get(".rg-error").should("have.length", 2);
    cy.location("pathname").should("eq", ROUTES.login);
  });

  it("muestra el mensaje del servidor si las credenciales son incorrectas", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: { codigo: "CREDENCIALES_INVALIDAS", error: "Usuario o contraseña incorrectos." },
    }).as("login");
    cy.visit(ROUTES.login);
    cy.get("#lg-username").type("admin");
    cy.get("#lg-password").type("ClaveMala123");
    cy.contains("button", "Ingresar").click();
    cy.wait("@login");
    cy.get(".rg-error-servidor").should("contain", "Usuario o contraseña incorrectos.");
  });

  it("inicia sesión como administrador y llega a su panel", () => {
    cy.intercept("POST", "**/auth/login", {
      body: { id: "a1", usuario: "admin", nombreCompleto: "Ana Admin", roles: ["ROL_ADMIN"], token: tokenFalso("admin") },
    }).as("login");
    cy.intercept("GET", "**/api/usuarios/perfil/a1", { body: perfil("admin") });
    cy.visit(ROUTES.login);
    cy.get("#lg-username").type("admin");
    cy.get("#lg-password").type("MiClaveSegura123!");
    cy.contains("button", "Ingresar").click();
    cy.wait("@login").its("request.body").should("deep.equal", { username: "admin", password: "MiClaveSegura123!" });
    cy.location("pathname").should("eq", ROUTES.home);
    cy.contains("Ana Admin").should("be.visible");
    cy.contains("ADMIN").should("be.visible");
  });

  it("muestra y oculta la contraseña", () => {
    cy.visit(ROUTES.login);
    cy.get("#lg-password").should("have.attr", "type", "password");
    cy.get("button[aria-label='Mostrar contraseña']").click();
    cy.get("#lg-password").should("have.attr", "type", "text");
  });

  it("sin sesión, una ruta protegida lleva al login", () => {
    cy.visit(ROUTES.usuarios);
    cy.location("pathname").should("eq", ROUTES.login);
  });

  it("un cliente no puede abrir una pantalla de administrador", () => {
    cy.simularApiBase("cliente");
    cy.visitarComo("cliente", ROUTES.usuarios);
    cy.location("pathname").should("eq", ROUTES.home);
  });

  it("envía el correo de recuperación de contraseña", () => {
    cy.intercept("POST", "**/auth/solicitar-recuperacion", { body: { mensaje: "ok" } }).as("recuperar");
    cy.visit(ROUTES.login);
    cy.contains("¿Olvidaste tu contraseña?").click();
    cy.location("pathname").should("eq", ROUTES.recuperar);
    cy.get("#fg-correo").type("laura@correo.com");
    cy.get("button[type=submit]").click();
    cy.wait("@recuperar").its("request.body").should("deep.include", { correo: "laura@correo.com" });
    cy.get(".rg-exito").should("contain", "te enviamos un enlace");
  });
});
