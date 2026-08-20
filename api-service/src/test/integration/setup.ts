import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

import { execSync } from "node:child_process";


// Speichert die Referenz auf den gestarteten PostgreSQL-Container.
// Dadurch können wir ihn nach den Tests wieder stoppen.
let container: StartedPostgreSqlContainer;


/*
 * Startet eine isolierte PostgreSQL-Testdatenbank.
 */
export async function startTestDatabase() {

    console.log("1. Starte Testcontainer");
    // Startet PostgreSQL-16-Container.
    container = await new PostgreSqlContainer(
        "postgres:16-alpine"
    )
        .withDatabase("bewerbung_test")

        .withUsername("test")

        .withPassword("test")

        .start();

    console.log("2. Container läuft");
    // Testcontainers erzeugt automatisch eine Connection-URL,
    // z. B.:
    // postgresql://test:test@localhost:54321/bewerbung_test
    //
    // Der Port wird normalerweise automatisch gewählt.
    //
    // Wir überschreiben DATABASE_URL nur für diesen Testprozess,
    // damit Prisma die Testdatenbank statt der Entwicklungsdatenbank nutzt.
    process.env.DATABASE_URL =
        container.getConnectionUri();


    console.log("3. Übertrage Prisma-Schema");
    // Überträgt das aktuelle Prisma-Schema auf die temporäre Testdatenbank.
    execSync(
        "npx prisma db push --skip-generate",
        {
            env: {
                ...process.env,

                DATABASE_URL:
                    process.env.DATABASE_URL,
            },

            stdio: "inherit",
        }
    );

    console.log("4. Prisma-Schema fertig");
    // Gibt den gestarteten Container zurück.
    // Kann nützlich sein, wenn der Test weitere Informationen
    // über den Container benötigt.
    return container;
}


/**
 * Stoppt die PostgreSQL-Testdatenbank.
 *
 * Beim Stoppen wird der Testcontainer entfernt.
 * Dadurch verschwinden auch die darin gespeicherten Testdaten.
 */
export async function stopTestDatabase() {

    // Nur stoppen, wenn vorher tatsächlich
    // ein Container gestartet wurde.
    if (container) {
        await container.stop();
    }
}