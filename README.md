# DriveVault Frontend

Angular frontend for the DriveVault microservices (`GoogleDrive`, `folder-service`, `Search-service`).

## What's here

- **Ledger-style file browser** — folders and files rendered as entries in a vault deposit ledger, with a monospace "reference number" per item, breadcrumb navigation, upload, create-folder, delete, and download.
- **Search** — hits the `Search-service` `/api/search` endpoint.
- **Login/Register** — ⚠️ **mocked**. Your backend doesn't have an auth microservice yet, so `auth.service.ts` fakes a session locally. Swap it out once you build one (the file has a comment showing the expected shape).
- **Share dialog** — ⚠️ **mocked** too, for the same reason — no sharing microservice exists yet. It generates a cosmetic link only.

## Setup

This is a set of standalone-component source files, not a zipped Angular CLI project (no `node_modules`/`angular.json` included) so it's easy to drop into an existing workspace. To run it fresh:

```bash
npm install -g @angular/cli
ng new drivevault-frontend --standalone --style=css --routing=false
cd drivevault-frontend
```

Then replace the generated `src/app`, `src/environments`, `src/styles.css`, `src/index.html`, and `src/main.ts` with the files from this folder, and run:

```bash
npm start
```

The app expects the three backend services running locally on their default ports:

| Service | Port |
|---|---|
| GoogleDrive (files) | 8081 |
| folder-service | 8082 |
| Search-service | 8083 |

Adjust `src/environments/environment.ts` if yours differ.

## ⚠️ You will need to enable CORS on the backend

None of the three Spring Boot services currently allow cross-origin requests, so calls from `http://localhost:4200` will be blocked by the browser. Add this to each service (or a shared config class):

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "DELETE", "PUT");
    }
}
```

## Known backend gaps this frontend works around

- **No root-level file listing** — `FileController` only exposes `GET /api/files/folder/{folderId}` (folderId is required), so the root view only shows folders. Upload is disabled at root; open a folder first.
- **No auth-service** — see above.
- **No sharing-service** — see above.
- **`FileController.createFile()`** in `GoogleDrive` has no `@PostMapping` annotation, so it's currently unreachable — not used by this frontend (uploads go through `/api/files/upload` instead, which works).
