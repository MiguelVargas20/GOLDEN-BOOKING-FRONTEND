import { ROUTES } from "../support/routes.js";
import { pagina, usuariosLista } from "../support/datos.js";

describe("Usuarios (administrador)", () => {
  beforeEach(() => {
    cy.simularApiBase("admin");
    cy.intercept("GET", "**/api/usuarios?*", { body: pagina(usuariosLista) }).as("usuarios");
  });

  it("lista los usuarios con su rol y estado, y busca", () => {
    cy.visitarComo("admin", ROUTES.usuarios);
    cy.wait("@usuarios");
    cy.contains("tr", "Ana Admin").should("contain", "Administrador").and("contain", "Activo");
    cy.contains("tr", "Laura Pérez").should("contain", "Cliente").and("contain", "52123456");
    cy.get("input[aria-label='Buscar usuarios']").type("52123");
    cy.get(".gb-tabla tbody tr").should("have.length", 1).and("contain", "Laura Pérez");
  });

  it("crea un administrador con todos los datos", () => {
    cy.intercept("POST", "**/api/usuarios?rol=ROL_ADMIN", { statusCode: 201, body: { id: "a2" } }).as("crear");
    cy.visitarComo("admin", ROUTES.usuarios);
    cy.contains("button", "Agregar usuario").click();
    cy.location("pathname").should("eq", ROUTES.usuariosCrear);
    cy.get("#fu-nombre").type("Carlos");
    cy.get("#fu-apellido").type("Rojas");
    cy.get("#fu-numeroDocumento").type("80123456");
    cy.get("#fu-fechaNacimiento").type("1988-03-02");
    cy.get("#fu-email").type("carlos@goldenbooking.com");
    cy.get("#fu-telefono").type("3201112233");
    cy.get("#fu-ciudad").type("Cali");
    cy.get("#fu-username").type("carlosr");
    cy.get("#fu-password").type("Recepcion2026");
    cy.get("#fu-rol").select("ROL_ADMIN");
    cy.get("button[type=submit]").click();
    cy.wait("@crear").its("request.body").should("deep.include", {
      nombre: "Carlos", apellido: "Rojas", documento: { tipo: "CC", numeroD: "80123456" },
      fechaNacimiento: "1988-03-02", email: "carlos@goldenbooking.com", username: "carlosr", password: "Recepcion2026",
      direccion: { cll: null, crr: null, cd: "Cali", ps: "Colombia" },
    });
    cy.dialogoDice("Usuario creado");
    cy.location("pathname").should("eq", ROUTES.usuarios);
  });

  it("edita un usuario: lo desactiva y confirma el cambio de documento", () => {
    cy.intercept("PUT", "**/api/usuarios/c1", { body: usuariosLista[1] }).as("editar");
    cy.visitarComo("admin", ROUTES.usuarios);
    cy.contains("tr", "Laura Pérez").contains("button", "Editar").click();
    cy.location("pathname").should("eq", "/usuarios-edit");
    cy.get("#fu-nombre").should("have.value", "Laura");
    cy.get("#fu-ciudad").should("have.value", "Medellín");
    cy.get("#fu-numeroDocumento").clear().type("52999999");
    cy.get("#fu-estado").select("INACTIVO");
    cy.get("button[type=submit]").click();
    cy.dialogoDice("¿Cambiar el número de documento?");
    cy.confirmarDialogo("Sí, cambiarlo");
    cy.wait("@editar").its("request.body").should("deep.include", {
      documento: { tipo: "CC", numeroD: "52999999" }, estado: "INACTIVO", roles: ["ROL_CLIENTE"],
    });
    cy.dialogoDice("Usuario actualizado");
  });

  it("elimina un usuario después de confirmar", () => {
    cy.intercept("DELETE", "**/api/usuarios/c1", { statusCode: 204 }).as("eliminar");
    cy.visitarComo("admin", ROUTES.usuarios);
    cy.get("button[aria-label='Eliminar a Laura Pérez']").click();
    cy.dialogoDice("¿Eliminar usuario?");
    cy.confirmarDialogo("Sí, eliminar");
    cy.wait("@eliminar");
    cy.dialogoDice("Usuario eliminado");
  });
});
