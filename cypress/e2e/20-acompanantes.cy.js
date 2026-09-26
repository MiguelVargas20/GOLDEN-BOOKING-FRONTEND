import { ROUTES } from "../support/routes.js";
import { espacios, miMembresia, reservaDeporte } from "../support/datos.js";

const dia15MesSiguiente = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return `15/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const MIEMBROS = [
  { nombre: "Pedro Pérez", tipoDocumento: "CC", numeroDocumento: "80123456" },
  { nombre: "Sofía Pérez", tipoDocumento: "TI", numeroDocumento: "1012345678" },
];

describe("Acompañantes de una reserva (cédula o tarjeta de identidad)", () => {
  beforeEach(() => {
    cy.simularApiBase("cliente");
    cy.intercept("GET", "**/api/espacios-deportivos", { body: espacios });
  });

  it("registra acompañantes al reservar y los envía con su documento", () => {
    cy.intercept("POST", "**/api/reservas/deporte", { statusCode: 201, body: reservaDeporte({ miembros: MIEMBROS }) }).as("crear");
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [] });
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.contains(".ge-card", "Cancha de Tenis 1").click();
    cy.get("#re-dia").type(`${dia15MesSiguiente()}{enter}`);
    cy.get("[data-hora='10:00']").click();

    cy.contains("button", "Agregar acompañante").click();
    cy.get("input[aria-label='Nombre del acompañante 1']").type("Pedro Pérez");
    cy.get("input[aria-label='Documento del acompañante 1']").type("80123456");
    cy.contains("button", "Agregar acompañante").click();
    cy.get("input[aria-label='Nombre del acompañante 2']").type("Sofía Pérez");
    cy.get("select[aria-label='Tipo de documento del acompañante 2']").select("TI");
    cy.get("input[aria-label='Documento del acompañante 2']").type("1012345678");

    cy.contains("button", "Solicitar reserva").click();
    cy.confirmarDialogo("Sí, enviar solicitud");
    cy.wait("@crear").its("request.body.miembros").should("deep.equal", MIEMBROS);
  });

  it("no deja agregar al titular como acompañante", () => {
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.contains(".ge-card", "Cancha de Tenis 1").click();
    cy.get("#re-dia").type(`${dia15MesSiguiente()}{enter}`);
    cy.get("[data-hora='10:00']").click();
    cy.contains("button", "Agregar acompañante").click();
    cy.get("input[aria-label='Nombre del acompañante 1']").type("Laura Pérez");
    cy.get("input[aria-label='Documento del acompañante 1']").type("52123456");
    cy.contains("button", "Solicitar reserva").click();
    cy.dialogoDice("Revisa los acompañantes");
    cy.get(".swal2-html-container").should("contain", "No te registres a ti mismo");
  });

  it("muestra los acompañantes en el detalle y permite editarlos", () => {
    cy.intercept("GET", "**/api/reservas/deporte/mis-reservas", { body: [reservaDeporte({ miembros: MIEMBROS })] });
    cy.intercept("PATCH", "**/api/reservas/deporte/rd1/miembros", { body: reservaDeporte({ miembros: [MIEMBROS[0]] }) }).as("miembros");
    cy.visitarComo("cliente", ROUTES.misReservasDeporte);
    cy.contains("tr", "Cancha de Tenis 1").find("button[aria-label='Ver detalle']").click();
    cy.get(".modal").should("contain", "Acompañantes").and("contain", "Pedro Pérez").and("contain", "Sofía Pérez");
    cy.get(".modal").contains("button", "Editar").click();
    cy.get("button[aria-label='Quitar acompañante 2']").click();
    cy.contains("button", "Guardar acompañantes").click();
    cy.wait("@miembros").its("request.body").should("deep.equal", { miembros: [MIEMBROS[0]] });
  });

  it("el socio ve su descuento antes de reservar", () => {
    cy.intercept("GET", "**/api/membresias/mia", { body: miMembresia({ membresia: "MIEMBRO", descuento: 10, diasAnticipacion: 365 }) });
    cy.visitarComo("cliente", ROUTES.reservasDeportivas);
    cy.contains(".ge-card", "Cancha de Tenis 1").click();
    cy.get(".re-socio").should("contain", "10");
    cy.get("#re-dia").type(`${dia15MesSiguiente()}{enter}`);
    cy.get("[data-hora='10:00']").click();
    cy.get(".re-total strong").should("contain", "36.000"); // 40.000 − 10 %
  });
});
