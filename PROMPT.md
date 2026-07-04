# Frontend Build Prompt — DriveVault

Use this prompt (with an AI tool, or as a brief for a teammate) to regenerate or extend the DriveVault frontend.

---

Build a web frontend for **DriveVault**, a Google-Drive-style file storage app backed by three independent Spring Boot microservices:

1. **GoogleDrive** (file storage) — `http://localhost:8081/api/files`
   - `GET /` — list all files
   - `GET /{id}` — get one file
   - `GET /folder/{folderId}` — list files in a folder
   - `POST /upload` — multipart form: `name` (string), `folderId` (long), `file` (binary) → `{ success, file }`
   - `GET /download/{id}` — returns raw file bytes with `Content-Disposition: attachment`
   - `DELETE /{id}` — delete a file
   - File shape: `{ id: number, name: string, size: number, folderId: number, path: string }`

2. **folder-service** — `http://localhost:8082/api/folders`
   - `GET /` — list all folders
   - `GET /{id}` — get one folder
   - `GET /parent/{parentId}` — list child folders of a given parent
   - `POST /create` — body: `{ name, parentId }` → `{ Success, folder }`
   - `DELETE /{id}` — delete a folder
   - Folder shape: `{ id: number, name: string, parentId: number | null }` (`parentId: null` = root)

3. **Search-service** — `http://localhost:8083/api/search`
   - `GET ?query=...` → `{ files: [...], folders: [...] }` (also has `/files` and `/folders` sub-endpoints)

There is **no auth microservice and no sharing microservice yet** — build those UI flows against a clearly-labeled local mock so they can be swapped for real endpoints later.

## Frontend requirements

- **Stack**: Angular (standalone components, signals, no NgModules), plain CSS (no framework).
- **Screens**:
  - Login / register (mocked)
  - A single-page file browser: breadcrumb navigation, folder grid/list, file list, upload, create-folder, delete, download, search bar, share action (mocked)
- **Design direction**: don't use generic dashboard-template styling. Ground the visual identity in the product's own concept — e.g. a bank vault / ledger book metaphor: monospace "reference numbers" per item, ruled rows, a stamped/ledger header treatment. Pick your own concrete direction, name a 4–6 color palette and 2–3 typefaces (display/body/mono), and justify each choice against the brief before writing code.
- **Resilience**: every service call should handle failure gracefully with a visible, specific error message (e.g. "Is the folder service running on port 8082?") rather than a silent failure or generic toast.
- **Responsiveness**: usable down to mobile widths; visible keyboard focus states; respect `prefers-reduced-motion`.

## Known constraints to design around

- Files always belong to a folder (`folderId` is required) — there's no way to list "root-level files," so the root view should only show folders and prompt the user to open one before uploading.
- CORS is not yet configured on any of the three services — the frontend will need `http://localhost:4200` (or whatever origin it runs on) allow-listed on the backend before requests succeed.
