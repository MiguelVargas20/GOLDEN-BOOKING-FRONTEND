import { defineConfig } from "cypress";

// Pruebas de extremo a extremo del frontend. El backend se simula con
// cy.intercept en cada prueba: solo hace falta el frontend corriendo
// (npm run dev) y el comando npm run test:e2e.
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 800,
    // Centra el elemento antes de hacer clic: así la barra de navegación fija no lo tapa
    scrollBehavior: "center",
    video: false,
  },
});
