# DriveVault Frontend

Angular frontend for the DriveVault microservices (`GoogleDrive`, `folder-service`, `Search-service`).

DriveVault is a Google Drive–style file storage application built as a set of
independent microservices with an Angular frontend. Users can register/sign
in, create folders, upload and download files, search across their vault,
and generate (simulated) share links — all styled around a "bank deposit
ledger" visual theme, where every file and folder is a stamped entry in the
book.

> **Note:** Some backend services (auth, sharing) are currently mocked on the
> frontend, since the corresponding microservices don't exist yet. See
> [Current limitations](#current-limitations) below for the full picture.

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Running the services](#running-the-services)
- [Frontend](#frontend)
- [Features](#features)
- [Design system](#design-system)
- [Current limitations](#current-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Architecture

DriveVault follows a microservices architecture: each core capability
(folders, files, search) is its own independently deployable service, and the
Angular frontend talks to each one directly over HTTP.

```
                        ┌─────────────────────┐
                        │   Angular Frontend    │
                        │  (drivevault-frontend) │
                        └──────────┬────────────┘
                                   │
            ┌──────────────────────┼───────────────────────┐
            │                      │                        │
   ┌────────▼────────┐   ┌─────────▼─────────┐   ┌──────────▼─────────┐
   │  folder-service   │   │  GoogleDrive       │   │  Search-service     │
   │  (Folders API)     │   │  (Files API)        │   │  (Search API)         │
   │  Port: 8082         │   │  Port: 8081          │   │  Port: 8083           │
   └─────────────────────┘   └──────────────────────┘   └────────────────────────┘
```

Each service owns its own data and exposes a REST API consumed by the
frontend's Angular services (`folder.service.ts`, `file.service.ts`,
`search.service.ts`).

## Tech stack

**Frontend**
- Angular (standalone components, signals)
- TypeScript
- RxJS
- Plain CSS with a custom design-token system (no UI framework/Tailwind)

**Backend**
- Independent microservices (see [Project structure](#project-structure) for
  what lives where)
- REST APIs consumed over HTTP from the frontend

## Project structure

```
DriveVault/
├── GoogleDrive/            # File storage microservice (upload/download/delete) — port 8081
├── folder-service/         # Folder management microservice (CRUD, hierarchy) — port 8082
├── Search-service/         # Search microservice (files + folders) — port 8083
└── drivevault-frontend-ready/   # Angular frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── login/              # Sign in / register screen
    │   │   │   ├── drive/               # Main app shell — ledger view, breadcrumbs, toolbar
    │   │   │   ├── upload-dialog/        # Upload modal (drag & drop)
    │   │   │   ├── new-folder-dialog/    # Create folder modal
    │   │   │   └── share-dialog/         # Share link modal (simulated)
    │   │   ├── services/
    │   │   │   ├── auth.service.ts        # Mocked auth (local only)
    │   │   │   ├── folder.service.ts      # Talks to folder-service (8082)
    │   │   │   ├── file.service.ts        # Talks to GoogleDrive file service (8081)
    │   │   │   └── search.service.ts      # Talks to Search-service (8083)
    │   │   ├── models/                    # Folder & FileItem interfaces
    │   │   ├── auth.guard.ts              # Route guard for /drive
    │   │   ├── app.routes.ts
    │   │   └── app.config.ts
    │   └── styles.css                    # Global design tokens & shared component styles
    ├── angular.json
    └── package.json
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended) and npm
- [Angular CLI](https://angular.dev/tools/cli) — `npm install -g @angular/cli`
- Each backend microservice's own runtime (see that service's own
  README/build file for its stack and requirements)

### Clone the repo

```bash
git clone https://github.com/mohitpawar61/DriveVault.git
cd DriveVault
```

## Running the services

Each backend microservice needs to be running for its corresponding feature
to work in the frontend. Start each one according to its own project setup,
on these expected ports:

| Service          | Responsibility                          | Port |
|-------------------|------------------------------------------|------|
| `GoogleDrive`      | File upload, download, delete             | 8081 |
| `folder-service`   | Folder creation, listing, deletion         | 8082 |
| `Search-service`   | Search across files and folders            | 8083 |

If a service isn't running, the frontend will surface a specific error (e.g.
*"Could not reach the folder service. Is it running on port 8082?"*) rather
than failing silently.

## Frontend

```bash
cd drivevault-frontend-ready
npm install
ng serve
```

Then open `http://localhost:4200`.

### Build for production

```bash
ng build
```

Output is written to `dist/`.

## Features

- **Sign in / register** — email + password form (currently backed by a
  local mock, see limitations)
- **Folder navigation** — create folders, drill into subfolders, breadcrumb
  trail back to the root ("Vault")
- **File upload** — drag-and-drop or file picker, with editable display name
- **File download** — pulls the file as a blob and triggers a save
- **Delete** — remove files or folders (with confirmation)
- **Search** — search files and folders by name across the vault
- **Share (simulated)** — generate a "view" or "edit" permission link and
  copy it to the clipboard
- **Responsive UI** — the ledger table collapses into stacked cards on
  mobile; layout adapts down to small screens

## Design system

The frontend uses a distinct "bank vault ledger" visual identity rather than
a generic admin-panel look:

- **Typography** — Fraunces (display serif) + Inter (body) + IBM Plex Mono
  (serials, sizes, technical data)
- **Palette** — ink (`#101826`), paper (`#F3F0E7`), vault green (`#1F6F5C`),
  stamp orange (`#B5652B`)
- **Signature elements** — a wax-stamp badge motif for verified/shared
  states, and a rotary vault-dial illustration on the sign-in screen
- **Accessibility** — visible focus states on all interactive elements,
  `prefers-reduced-motion` respected throughout

All design tokens live in `src/styles.css` and are shared across components
via CSS custom properties.

## Current limitations

Being upfront about what's real vs. simulated right now:

- **Authentication is mocked** — `auth.service.ts` runs entirely on the
  frontend; any email/password combination will "work" because there's no
  auth microservice yet.
- **Sharing is simulated** — the share dialog generates a link locally, but
  it isn't backed by a real sharing service, so shared links aren't
  functional for other users.
- **Root folder has no direct file listing** — files must live inside a
  folder; the root view only shows top-level folders.

## Roadmap

- [ ] Real authentication microservice (replace the local mock)
- [ ] Real sharing/permissions microservice
- [ ] File previews (images, PDFs)
- [ ] Folder-level file listing at root
- [ ] Pagination / infinite scroll for large vaults
- [ ] Automated tests (unit + e2e) for frontend and services

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

Built by [mohitpawar61](https://github.com/mohitpawar61).


# DriveVault Backend

DriveVault is a **Google Drive–style cloud storage backend** built as a set of independent **Java Spring Boot microservices**. It lets clients upload/download files, organize them into nested folders, and search across both files and folders — with each concern (file storage, folder hierarchy, search) isolated into its own service.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Services](#services)
  - [1. GoogleDrive (File Service)](#1-googledrive-file-service)
  - [2. folder-service](#2-folder-service)
  - [3. Search-service](#3-search-service)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Running the Services](#running-the-services)
- [Testing the APIs](#testing-the-apis)
- [Database](#database)
- [CORS Configuration](#cors-configuration)
- [Known Limitations / Notes](#known-limitations--notes)
- [Roadmap Ideas](#roadmap-ideas)
- [License](#license)

---

## Architecture Overview

DriveVault follows a **microservices architecture**. Each service owns its own database, domain model, and REST API, and communicates with other services over HTTP using **Spring Cloud OpenFeign** declarative clients.

```
                         ┌───────────────────────┐
                         │     Search-service     │
                         │      (port 8083)       │
                         │  aggregates & filters  │
                         └───────────┬───────────┘
                     Feign Client    │    Feign Client
                 ┌───────────────────┴───────────────────┐
                 ▼                                        ▼
   ┌─────────────────────────┐             ┌─────────────────────────┐
   │   GoogleDrive service    │             │     folder-service       │
   │      (port 8081)         │             │       (port 8082)        │
   │  File upload/download,   │             │  Folder CRUD & nested    │
   │  metadata (H2 in-memory) │             │  hierarchy (H2 in-memory)│
   └─────────────────────────┘             └─────────────────────────┘
```

- **GoogleDrive** — handles file upload, download, storage on disk, and file metadata (name, size, folder association).
- **folder-service** — handles folder creation and the parent/child folder hierarchy.
- **Search-service** — a stateless aggregator that calls the other two services via Feign clients and returns filtered results based on a search query.

Each service is independently runnable and uses its own **embedded H2 in-memory database** (except Search-service, which holds no data of its own).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 (GoogleDrive, Search-service) / Java 21 (folder-service) |
| Framework | Spring Boot 3.5.14 (GoogleDrive, Search-service) / Spring Boot 4.1.0 (folder-service) |
| Web | Spring Web / Spring WebMVC |
| Persistence | Spring Data JPA + Hibernate |
| Database | H2 (in-memory), MySQL connector included (GoogleDrive) |
| Inter-service Communication | Spring Cloud OpenFeign |
| Build Tool | Maven (with Maven Wrapper `mvnw` / `mvnw.cmd`) |
| API Style | REST (JSON) |

---

## Services

### 1. GoogleDrive (File Service)

**Port:** `8081`
**Package:** `com.cfs.googledrive`

Responsible for file metadata and physical file storage.

**Entity — `FileEntity`**

| Field | Type | Description |
|---|---|---|
| `id` | Long | Unique file ID (generated from `System.currentTimeMillis()`) |
| `name` | String | Original file name |
| `size` | Long | File size in bytes |
| `folderId` | Long | ID of the parent folder |
| `path` | String | Virtual path (`/files/{id}`) |

Files are physically written to a local `uploads/{id}/{filename}` directory on the server's filesystem, while metadata is persisted to the H2 database via `FileRepository` (`JpaRepository`).

Key behavior:
- **Upload** — accepts a `multipart/form-data` request, saves the raw bytes under `uploads/<generated-id>/<filename>`, and stores metadata in the DB.
- **Download** — looks up the file by ID, reads the bytes from disk, and streams them back with `Content-Disposition: attachment`.
- Max upload size is configured at **10MB** per file/request.

### 2. folder-service

**Port:** `8082`
**Package:** `com.storage.folderservice`

Responsible for the folder hierarchy (nested folders via `parentId`).

**Entity — `FolderEntity`**

| Field | Type | Description |
|---|---|---|
| `id` | Long | Unique folder ID (generated from `System.currentTimeMillis()`) |
| `name` | String | Folder name |
| `parentId` | Long | ID of the parent folder (nullable — `null`/root for top-level folders) |

`FolderRepository` extends `JpaRepository` and adds a `findByParentId` query to support browsing folder contents.

### 3. Search-service

**Port:** `8083`
**Package:** `com.storage.searchservice`

A stateless orchestration layer with **no database of its own**. It uses two Feign clients:

- `FileSearchClient` → calls `GoogleDrive` at `http://localhost:8081`
- `FolderSearchClient` → calls `folder-service` at `http://localhost:8082`

It fetches all files/folders from those services and filters them in-memory (case-insensitive substring match on `name`) based on the `query` parameter.

> **Note:** In the current implementation, the combined `/api/search` endpoint filters files twice (once into `fileResult` and, due to a copy-paste in the source, again into `folderResult` from the same file list) rather than filtering the folder list. The dedicated `/api/search/folders` endpoint correctly filters folders. See [Known Limitations](#known-limitations--notes).

---

## Project Structure

```
DriveVault-master/
├── GoogleDrive/                         # File upload/download microservice (port 8081)
│   ├── src/main/java/com/cfs/googledrive/
│   │   ├── GoogleDriveApplication.java  # Spring Boot entry point
│   │   ├── config/Config.java           # CORS configuration
│   │   ├── controller/FileController.java
│   │   ├── model/FileEntity.java
│   │   └── repository/FileRepository.java
│   ├── src/main/resources/application.properties
│   └── pom.xml
│
├── folder-service/                      # Folder hierarchy microservice (port 8082)
│   ├── src/main/java/com/storage/folderservice/
│   │   ├── FolderServiceApplication.java
│   │   ├── config/config.java           # CORS configuration
│   │   ├── controller/FileController.java   # (folder CRUD endpoints)
│   │   ├── model/FolderEntity.java
│   │   └── repo/FolderRepository.java
│   ├── src/test/java/.../FolderServiceApplicationTests.java
│   ├── src/main/resources/application.properties
│   └── pom.xml
│
└── Search-service/                      # Search aggregator microservice (port 8083)
    ├── src/main/java/com/storage/searchservice/
    │   ├── SearchServiceApplication.java
    │   ├── config/Config.java           # CORS + Feign retry policy
    │   ├── client/FileSearchClient.java # Feign client → GoogleDrive
    │   ├── client/FolderSearchClient.java # Feign client → folder-service
    │   └── controller/SearchController.java
    ├── src/main/resources/application.properties
    └── pom.xml
```

---

## API Reference

### GoogleDrive Service — `http://localhost:8081`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/files` | List all files |
| `GET` | `/api/files/{id}` | Get a single file's metadata by ID |
| `GET` | `/api/files/folder/{folderId}` | List all files inside a given folder |
| `POST` | `/api/files/upload` | Upload a file (multipart form-data: `name`, `folderId`, `file`) |
| `GET` | `/api/files/download/{id}` | Download a file by ID |
| `DELETE` | `/api/files/{id}` | Delete a file by ID |

**Upload example (cURL):**
```bash
curl -X POST http://localhost:8081/api/files/upload \
  -F "name=resume.pdf" \
  -F "folderId=1" \
  -F "file=@/path/to/resume.pdf"
```

**Download example (cURL):**
```bash
curl -OJ http://localhost:8081/api/files/download/1723456789123
```

### folder-service — `http://localhost:8082`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/folders` | List all folders |
| `GET` | `/api/folders/{id}` | Get a single folder by ID |
| `GET` | `/api/folders/parent/{parentId}` | List all sub-folders of a given parent |
| `POST` | `/api/folders` | Create a folder (JSON body, requires an `id` since it isn't auto-generated on this endpoint) |
| `POST` | `/api/folders/create` | Create a folder with an auto-generated ID (JSON body: `name`, `parentId`) |
| `DELETE` | `/api/folders/{id}` | Delete a folder by ID |

**Create folder example (recommended endpoint):**
```bash
curl -X POST http://localhost:8082/api/folders/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Photos", "parentId": null}'
```

### Search-service — `http://localhost:8083`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search?query={text}` | Combined search across files and folders |
| `GET` | `/api/search/files?query={text}` | Search files only |
| `GET` | `/api/search/folders?query={text}` | Search folders only |

**Example:**
```bash
curl "http://localhost:8083/api/search/files?query=resume"
```

> Search-service requires **both GoogleDrive (8081) and folder-service (8082) to be running**, since it fetches live data from them on every request.

---

## Getting Started

### Prerequisites

- **Java 17** (for GoogleDrive & Search-service) and **Java 21** (for folder-service) — installing a recent JDK (17+) that satisfies both is recommended, e.g. **JDK 21**.
- **Maven** (or rely on the bundled Maven Wrapper — no separate install needed).
- No external database setup required — each service uses an in-memory **H2** database that resets on restart.

### Clone the Repository

```bash
git clone https://github.com/mohitpawar61/DriveVault.git
cd DriveVault
```

---

## Running the Services

Each service is a self-contained Spring Boot app with its own `pom.xml` and Maven Wrapper. Open **three terminal windows/tabs** and start them **in this order** (folder & file services first, then search, since search depends on the other two):

**Terminal 1 — GoogleDrive (File Service)**
```bash
cd GoogleDrive
./mvnw spring-boot:run        # macOS/Linux
mvnw.cmd spring-boot:run      # Windows
```
Runs on `http://localhost:8081`

**Terminal 2 — folder-service**
```bash
cd folder-service
./mvnw spring-boot:run
```
Runs on `http://localhost:8082`

**Terminal 3 — Search-service**
```bash
cd Search-service
./mvnw spring-boot:run
```
Runs on `http://localhost:8083`

Alternatively, build a runnable JAR for each service and run it directly:
```bash
./mvnw clean package
java -jar target/<service-name>-0.0.1-SNAPSHOT.jar
```

---

## Testing the APIs

You can test endpoints using **cURL**, **Postman**, or **Insomnia**.

Suggested flow:
1. Start `folder-service` and create a root folder via `POST /api/folders/create`.
2. Start `GoogleDrive` and upload a file into that folder via `POST /api/files/upload`.
3. Start `Search-service` and query `GET /api/search?query=<part of file/folder name>` to confirm cross-service search works.

---

## Database

- Each service (GoogleDrive, folder-service) uses an **embedded H2 in-memory database** (`jdbc:h2:mem:testdb`), auto-created and dropped on every restart (`spring.jpa.hibernate.ddl-auto=create-drop`) — **data is not persisted between restarts**.
- The H2 web console is enabled (`spring.h2.console.enabled=true`), typically accessible at `/h2-console` on each service's port (e.g. `http://localhost:8081/h2-console`).
- The GoogleDrive service also ships a **MySQL connector** dependency, so it can be reconfigured to use a persistent MySQL database in production by updating `application.properties`.

---

## CORS Configuration

All three services enable permissive CORS via a `WebMvcConfigurer` bean, allowing requests from any origin with `GET`, `POST`, `PUT`, and `DELETE` methods and credentials — convenient for local frontend development, but should be **tightened before deploying to production**.

---

## Known Limitations / Notes

This is a learning/demo-style project. A few things to be aware of before extending it:

- **No authentication/authorization** — all endpoints are open.
- **File IDs and folder IDs are generated with `System.currentTimeMillis()`**, not database auto-increment — this can theoretically collide under high concurrency.
- **`POST /api/folders`** expects the client to supply an `id`, while **`POST /api/folders/create`** auto-generates one — prefer the latter.
- The combined `GET /api/search` endpoint in `SearchController` currently filters the **files** list twice instead of filtering files and folders separately (a small bug in `SearchController.search()`); use `/api/search/files` and `/api/search/folders` separately if you need guaranteed-correct folder results.
- **No service discovery / API gateway** — service URLs are hardcoded (`localhost:8081`, `localhost:8082`) in the Feign client annotations, so all services must currently run on the same host.
- **In-memory H2 storage** means all folder/file metadata is lost on service restart; uploaded file bytes persist on disk in the `uploads/` directory, but their DB records won't.
- **Version mismatch**: `folder-service` uses Spring Boot 4.1.0 / Java 21, while `GoogleDrive` and `Search-service` use Spring Boot 3.5.14 / Java 17 — keep this in mind when standardizing JDKs across environments.

---

## Roadmap Ideas

- Add authentication (JWT / OAuth2, e.g. actual Google OAuth for a real "Google Drive" style login).
- Introduce a persistent database (PostgreSQL/MySQL) instead of in-memory H2.
- Add a Eureka/Consul service registry and an API Gateway (Spring Cloud Gateway) instead of hardcoded Feign URLs.
- Add pagination and proper full-text search (e.g. Elasticsearch) in Search-service.
- Add a frontend client (React/Angular) for a full Google Drive–like UI.
- Add file versioning, sharing, and permission controls.
- Containerize each service with Docker and orchestrate with Docker Compose/Kubernetes.

---

## License
Built by [mohitpawar61](https://github.com/mohitpawar61).
