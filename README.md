# Vintage Typewriter

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/API-Express-black?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Infrastructure-Docker-2496ED?logo=docker&logoColor=white)

A full-stack focused-writing application inspired by the tactile rhythm of a mechanical typewriter. It combines a custom interactive typewriter illustration with synthesized key sounds, paper themes, guest storage, account authentication, and a personal manuscript archive.

![Vintage Typewriter application](./docs/Typewriter.png)

## What It Does

- Recreates mechanical typing feedback with an interactive on-screen keyboard, carriage-return animation, and Web Audio-generated key sounds.
- Offers five CSS-driven paper themes: Vintage Cream, Pure White, Soft Ivory, Natural Linen, and Warm Sand.
- Lets guests write and archive manuscripts locally without creating an account.
- Supports email/password and Google authentication with JWTs stored in HttpOnly cookies.
- Stores authenticated users' manuscripts in PostgreSQL and isolates them by user.
- Detects local guest manuscripts after sign-in and lets the user explicitly import or discard them.
- Supports creating, reading, deleting, and exporting manuscripts as PNG images.

> Manuscript editing is currently create/read/delete rather than full CRUD. Updating an existing archived manuscript is planned work.

## Interface

<p align="center">
  <img src="./docs/login.png" width="400" alt="Vintage Typewriter login screen">
  <img src="./docs/strength-meter.png" width="400" alt="Registration password-strength indicator">
</p>

The UI is built primarily with CSS Modules. The typewriter itself is rendered with React, CSS, and inline SVG details; it is not a static image. Sound is synthesized in the browser with the Web Audio API and currently uses a mono output path.

## Architecture

### Client

- React 19 and TypeScript
- Vite development and production builds
- CSS Modules for component styling
- Axios instance with cookie credentials and an environment-configurable API base URL
- `useEditor` for cursor, keyboard, paper scrolling, and mechanical input behavior
- `useNotes` for guest and account manuscript persistence
- `useTypewriterSound` for generated mechanical audio
- React Context for session and guest-mode state
- html2canvas for PNG export

### Server

- Express 5 REST API written in TypeScript
- Prisma ORM with committed PostgreSQL migrations
- Argon2 password hashing with an application pepper
- Google ID-token verification
- JWT session cookies
- CORS allow-list configured through `CLIENT_URL`
- Authenticated, user-scoped note routes
- `/health` endpoint for container and hosting health checks

### Persistence Flow

Guests store manuscripts under a dedicated LocalStorage key. After authentication, the archive displays an explicit migration prompt. Manuscripts are uploaded only after the user chooses **Save to account**; choosing **Discard** removes the local copies.

## Local Development

### Prerequisites

- Node.js 22 or newer
- npm
- Docker with Docker Compose

### 1. Configure the environments

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Replace the placeholder secrets and Google client ID. The default client configuration uses `/api`; Vite proxies it to `http://localhost:5001` during development.

### 2. Install dependencies

```bash
npm install
npm ci --prefix client
npm ci --prefix server
```

### 3. Start the application

```bash
npm run dev
```

This single command starts PostgreSQL, waits for it to become healthy, synchronizes the local schema, and runs the client and server together. Press `Ctrl+C` to stop the development servers. Use `npm run dev:stop` if you also want to stop PostgreSQL. Production continues to use versioned Prisma migrations.

The client runs at `http://localhost:5173`; the API runs at `http://localhost:5001` and exposes its health check at `http://localhost:5001/health`.

## Configuration

### Client variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | `/api` | Public API base URL |
| `VITE_DEV_API_TARGET` | No | `http://localhost:5001` | Local Vite proxy target |
| `VITE_GOOGLE_CLIENT_ID` | For Google login | — | Google OAuth web client ID |

### Server variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `5001` | HTTP server port |
| `CLIENT_URL` | Yes in production | `http://localhost:5173` | Comma-separated CORS origins |
| `DATABASE_URL` | Yes | — | PostgreSQL connection URL |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `PASSWORD_PEPPER` | Yes | — | Additional password-hashing secret |
| `GOOGLE_CLIENT_ID` | For Google login | — | Accepted Google token audience |
| `NODE_ENV` | No | — | Enables secure cookies when set to `production` |

## Quality Checks

Run the same aggregate check used by CI:

```bash
npm run check
```

This lints the client and builds both the client and server. GitHub Actions runs it for every push and pull request.

## Production Containers

The production stack builds the React client into Nginx, proxies `/api` to the Express service, applies Prisma migrations at API startup, and persists PostgreSQL data in a named volume.

```bash
cp .env.production.example .env
# Replace every placeholder secret in .env
docker compose -f docker-compose.prod.yml up --build -d
```

By default, the application is available at `http://localhost:8080`. For a hosted environment, set `CLIENT_URL` to the public HTTPS origin and configure that same origin in Google Cloud Console. TLS should be terminated by the hosting platform or an HTTPS reverse proxy in front of this stack.

## Current Scope

- The archive creates, lists, loads, and deletes manuscripts; an update endpoint and autosave are not implemented yet.
- PNG export captures the paper component using html2canvas.
- Audio provides varied mechanical key effects but does not yet use stereo positioning.
- The repository does not currently publish a public live demo.

## License

Released under the [MIT License](./LICENSE). Copyright © 2026 Setayesh Golshan.
