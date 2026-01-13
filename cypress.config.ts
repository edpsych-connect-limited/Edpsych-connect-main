import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: (process.env.CYPRESS_BASE_URL?.trim() || 'http://127.0.0.1:3000'),
    browserConnectTimeout: 300000,
    defaultCommandTimeout: 60000,
    responseTimeout: 300000,
    pageLoadTimeout: 300000,
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
