import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    env: {
      apiUrl: "http://32.194.207.246:8080",
    },
    setupNodeEvents() {
      // aquí se registrarían eventos de Node si se necesitan
    },
  },
});