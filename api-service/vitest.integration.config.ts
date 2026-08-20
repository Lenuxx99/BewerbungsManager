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
            "src/modules/**/tests/integration/**/*.test.ts",
        ],

        /*
         * Integrationstest-Dateien nacheinander ausführen.
         *
         * Wichtig, weil alle dieselbe Testdatenbank verwenden
         * und ihre Daten mit beforeEach löschen.
         */

        //auth.api.integration.test.ts
        // → Container starten
        // → Tests
        // → Container stoppen

        // user.api.integration.test.ts
        // → Container starten
        // → Tests
        // → Container stoppen

        // app.api.integration.test.ts
        // → Container starten
        // → Tests
        // → Container stoppen

        fileParallelism: false,

        hookTimeout: 60_000,
        testTimeout: 30_000,
    },
});