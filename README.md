# Bewerbungsmanager

Ein Full-Stack-Webprojekt zur Verwaltung von Bewerbungen. Die Anwendung ermöglicht Benutzern, ihre Bewerbungen zentral zu organisieren, den aktuellen Status zu verfolgen und den gesamten Bewerbungsprozess übersichtlich zu verwalten.

## Deployment

Nach Abschluss der Entwicklung wird die Anwendung automatisiert in einer Cloud-Umgebung bereitgestellt.

Der Deployment-Prozess erfolgt über eine **CI/CD-Pipeline** und umfasst folgende Schritte:

* **Tests** – Ausführen automatisierter Tests
* **Build** – Erstellen der Anwendung
* **Terraform** – Bereitstellung und Verwaltung der Cloud-Infrastruktur (Infrastructure as Code)
* **Deployment** – Automatische Bereitstellung der Anwendung in der Cloud

Dadurch werden sowohl die Infrastruktur als auch die Anwendung reproduzierbar und automatisiert verwaltet.



## Projektübersicht

Der Bewerbungsmanager besteht aus mehreren Komponenten:

```
BEWERBUNGSMANAGER
├── api-service          # REST API (Express + TypeScript)
├── email-processor      # Verarbeitung und Versand von E-Mails
├── frontend             # React + TypeScript + Vite
├── infrastructure       # Docker, Konfiguration und Infrastruktur
├── README.md
└── bewerbungsmanagerdb.sql
```

## Technologien

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT Authentication
- Google OAuth Login

### Datenbank

- MySQL
- Prisma


## Funktionen

- Benutzerregistrierung
- Benutzeranmeldung
- Google Login (OAuth 2.0)
- JWT-basierte Authentifizierung
- Rollen- und Benutzerverwaltung
- Verwaltung von Bewerbungen
- Statusverwaltung von Bewerbungen
- E-Mail-Verarbeitung

## Projektstruktur

- **frontend** – Benutzeroberfläche
- **api-service** – REST-API und Geschäftslogik
- **email-processor** – Verarbeitung eingehender und ausgehender E-Mails
- **infrastructure** – Docker-Konfiguration und Infrastruktur

## Dokumentation

Im Repository befinden sich zusätzliche Dokumentationen:

- `Architekturübersicht.png` – Architektur des Systems
- `authentifizierungsablaeufe.pdf` – Authentifizierungsprozess
- `bewerbungsmanagerdb.sql` – Datenbankschema