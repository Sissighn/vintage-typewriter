# Vintage Typewriter

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38BDF8?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Framework-Express-black?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Infrastructure-Docker-2496ED?logo=docker&logoColor=white)
![html2canvas](https://img.shields.io/badge/Export-html2canvas-orange?logo=html5&logoColor=white)
![Argon2](https://img.shields.io/badge/Security-Argon2-9cf?logo=lock&logoColor=white)
![CSS Modules](https://img.shields.io/badge/Styling-CSS_Modules-000000?logo=cssmodules&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Auth-Google_OAuth_2.0-4285F4?logo=google&logoColor=white)

A full-stack mechanical writing simulation designed to provide a realistic analog experience within a modern web environment. This project demonstrates advanced React patterns, secure multi-provider authentication, and a hybrid persistence layer.

## Project Overview

![App Vorschau](./assets/screenshots/Typewriter.png)

This application serves as a minimalist, focused writing station. It mimics the tactile nature of a vintage typewriter through precise input handling and mechanical logic. Unlike simple text editors, this project manages complex state interactions between a multi-user authentication system, a dynamic stationery system, and a persistent database archive.

## Technical Features

- **Multi-Provider Authentication**: Secure login via Google OAuth 2.0 or traditional Email/Password, managed through JWTs and protected HttpOnly cookies.
<p align="center">
  <img src="./docs/login.png" width="400" alt="Login Seite">
  <img src="./docs/strength-meter.png" width="400" alt="Passwort Stärke">
</p>

- **Hybrid Persistence (Guest Mode)**: Full "Try-before-you-buy" experience. Guests can use the typewriter immediately (storing data in LocalStorage), while registered users sync to a PostgreSQL cloud database.
- **Intelligent Data Migration**: Privacy-focused logic that allows users to "claim" their guest manuscripts after signing in, ensuring a seamless transition without data loss.
- **Mechanical Input Engine**: High-fidelity simulation of typewriter mechanics, including carriage returns, tab stops, and spatialized mechanical sound effects.
- **Stationery Management**: A dedicated configuration layer for dynamic CSS-driven paper textures and styles (Vintage Cream, Blueprint, Legal Pad, etc.).
- **Persistent Manuscript Archive**: A custom-built filing box system for full CRUD operations (Create, Read, Update, Delete) on user manuscripts.
- **Immersive Audio Hooks**: Custom hooks designed to trigger spatialized mechanical sound effects synchronized with user input.
- **MacOS Compatibility**: Architected to utilize Port 5001 to bypass the default Port 5000 conflict caused by the macOS AirPlay Receiver.

## Tech Stack

### Frontend

- **React (TypeScript)**: Core framework for UI and state management.
- **Axios**: Centralized API instance with withCredentials for secure cookie-based sessions.
- **Custom Hooks**: Implementation of the Separation of Concerns (SoC) principle through specialized logic hooks (`useTypewriterLogic`, `useNotesApi`).
- **Vite**: High-performance build tool and development server.

### Backend

- **Node.js & Express**: TypeScript-based RESTful API.
- **Prisma ORM**: Type-safe database access and automated schema migrations.
- **PostgreSQL**: Relational database for persistent storage of manuscript data.
- **Security**: Password hashing with Argon2, JWT session management, and CORS protection.

### Infrastructure

- **Docker**: Containerization of the PostgreSQL environment for consistent development across platforms.
- **Google Cloud Console**: OAuth 2.0 integration for secure social logins.

## Architecture and Problem Solving

### Separation of Concerns (SoC)

To ensure a portfolio-ready codebase, the application logic is decoupled from the view layer.

- **Logic Layer**: Encapsulated in Custom Hooks. The UI components remain "dumb," only rendering data provided by the logic hooks.
- **Auth Layer**: Global state management via React Context API to handle user sessions across the entire app.

### Resolved Technical Challenges

- **Session Persistence**: Implemented a /auth/me endpoint to verify JWT cookies on page refresh, preventing accidental logouts.
- **Privacy on Shared Devices**: Developed a permission-based migration prompt to prevent guest notes from being accidentally merged into the wrong user account.
- **Cross-Origin Security**: Configured COOP (Cross-Origin-Opener-Policy) and CORS headers to allow secure Google OAuth popups on localhost.

## Installation and Setup

### 1. Prerequisites

- Docker Desktop
- Node.js (v18+)
- npm

### 2. Environment Setup

Configure a `.env` file in the `/client` and `/server` directory:

#### Server (.env):

```env
PORT=5001
DATABASE_URL="postgresql://user:password@localhost:5432/typewriter_db"
JWT_SECRET="your_secret_key"
GOOGLE_CLIENT_ID="your_google_id"
```

#### Client (.env):

```env
VITE_GOOGLE_CLIENT_ID="your_google_id"
```

### 3. Infrastructure Initialization

```env
# Launch PostgreSQL via Docker
docker-compose up -d

# Sync database schema via Prisma
cd server
npx prisma db push
```

### 4. Development Execution

```env
# Start the Backend Server
cd server
npm run dev

# Start the Frontend Client
cd client
npm run dev
```

## License

MIT License © 2026 Setayesh Golshan
