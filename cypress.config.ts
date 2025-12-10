import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    defaultCommandTimeout: 30000,
    responseTimeout: 120000,
    pageLoadTimeout: 120000,
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });
    },
  },
});
