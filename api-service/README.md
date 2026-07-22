# Prisma & API – Kurzübersicht

## Prisma Client

Prisma erzeugt aus den Models in dieser Datei einen TypeScript-Client.

Beispiele:

```ts
prisma.users.findUnique(...)
prisma.users.create(...)
prisma.oauth_accounts.findMany(...)
```

Nach jeder Änderung am `schema.prisma` muss der Prisma Client neu generiert werden:

```bash
npx prisma generate
```

---

## Datenbankverbindung

Prisma verbindet sich über die Variable `DATABASE_URL` aus der `.env`-Datei mit PostgreSQL.

Beispiel:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATENBANK"
```

Lokale PostgreSQL-Installation:

```env
DATABASE_URL="postgresql://postgres:meinPasswort@localhost:5432/bewerbungsmanagerdb"
```


---

## Prisma verwenden

### 1. Abhängigkeiten installieren

```bash
npm install
```

---

### 2. Prisma Client generieren

```bash
npx prisma generate
```

---

### 3. Bereits vorhandene Datenbank verwenden

Falls die Tabellen bereits existieren:

```bash
npx prisma db pull
```

Danach erneut den Client generieren:

```bash
npx prisma generate
```

---

### 4. Neue Migration erstellen

Wenn Models in `schema.prisma` hinzugefügt oder geändert wurden, erstellt Prisma eine Migration und übernimmt die Änderungen in die Datenbank.

```bash
npx prisma migrate dev --name <beschreibung>
```

Beispiel:

```bash
npx prisma migrate dev --name create_oauth_accounts
```

Dadurch wird beispielsweise:

- eine neue Tabelle erstellt,
- eine bestehende Tabelle geändert (z. B. neue Spalte),
- ein Index oder eine Relation hinzugefügt,

je nachdem, welche Änderungen im `schema.prisma` vorgenommen wurden.
---

### 5. Prisma Studio öffnen

Zum Anzeigen und Bearbeiten der Datenbank:

```bash
npx prisma studio
```

---

## Models

Jedes `model` entspricht einer Tabelle in PostgreSQL.

Beispiel:

```prisma
model users {
  id    Int    @id @default(autoincrement())
  email String @unique
}
```


> **Wichtig:** Prisma arbeitet ausschließlich mit den Models in `schema.prisma`. Existiert dort kein Model, kann Prisma auch nicht auf die entsprechende Tabelle zugreifen.

---

## API-Routen

Alle Endpunkte beginnen mit:

```text
/api
```

### Authentifizierung

```text
POST /api/auth/login
Body:
{
  "email": "user@example.com",
  "password": "password123"
}
```

```text
POST /api/auth/register
Body:
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Max",
  "lastName": "Mustermann"
}
```

```text
POST /api/auth/google
Body:
{
  "credential": "<Google ID Token>"
}
```

```text
POST /api/auth/logout
Body:
{}
```

---

## Server starten

Entwicklungsmodus:

```bash
npm run dev
```

Produktions-Build:

```bash
npm run build
```

Server starten:

```bash
npm start
```
