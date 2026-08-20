import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  test: {
    environment: "node",

    include: [
      "src/test/backend-e2e/*.e2e.test.ts",
    ],

    /*
      E2E-Dateien nacheinander ausführen.

      Sinnvoll, weil alle gegen dieselbe
      laufende API und dieselbe Testdatenbank testen.
    */
    fileParallelism: false,

    /*
      Maximale Laufzeit pro Test.
    */
    testTimeout: 30_000,
  },
});

// E2E Ablauf:
//
// docker compose -f docker-compose.e2e.yml up -d --build
//         ↓
// PostgreSQL Test-DB startet
//         ↓
// API Container aus Dockerfile startet
//         ↓
// Datenbank-Schema wird vorbereitet
//         ↓
// npm run test:e2e
//         ↓
// auth.e2e.test.ts
// user.me.e2e.test.ts
// app.e2e.test.ts
//         ↓
// docker compose -f docker-compose.e2e.yml down -v