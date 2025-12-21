import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    browserConnectTimeout: 120000,
    defaultCommandTimeout: 30000,
    responseTimeout: 120000,
    pageLoadTimeout: 120000,
    env: {
      // Keep Cypress password in sync with prisma seed scripts
      SEED_TEST_USERS_PASSWORD: process.env.SEED_TEST_USERS_PASSWORD?.trim() || undefined,
    },
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
