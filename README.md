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

A full-stack mechanical writing simulation designed to provide a realistic analog experience within a modern web environment. This project demonstrates advanced React patterns, custom hook architecture, and robust backend integration.

## Project Overview

This application serves as a minimalist, focused writing station. It mimics the tactile nature of a vintage typewriter through precise input handling, spatialized audio, and mechanical carriage logic. Unlike simple text editors, this project manages complex state interactions between the keyboard engine, a dynamic stationery system, and a persistent database archive.

## Technical Features

- **Mechanical Input Engine**: High-fidelity simulation of typewriter mechanics, including carriage returns, tab stops, and realistic backspacing.
- **Stationery Management**: A dedicated configuration layer for dynamic CSS-driven paper textures and styles (Vintage Cream, Blueprint, Legal Pad, etc.).
- **Persistent Manuscript Archive**: A custom-built filing box system for full CRUD operations (Create, Read, Update, Delete) on user manuscripts.
- **Immersive Audio Hooks**: Custom hooks designed to trigger spatialized mechanical sound effects synchronized with user input.
- **MacOS Compatibility**: Architected to utilize Port 5001 to bypass the default Port 5000 conflict caused by the macOS AirPlay Receiver.

## Tech Stack

### Frontend

- **React (TypeScript)**: Core framework for UI and state management.
- **Custom Hooks**: Implementation of the Separation of Concerns (SoC) principle through specialized logic hooks (`useTypewriterLogic`, `useNotesApi`).
- **Vite**: High-performance build tool and development server.

### Backend

- **Node.js & Express**: TypeScript-based RESTful API.
- **Prisma ORM**: Type-safe database access and automated schema migrations.
- **PostgreSQL**: Relational database for persistent storage of manuscript data.

### Infrastructure

- **Docker**: Containerization of the PostgreSQL environment for consistent development across platforms.

## Architecture and Problem Solving

### Separation of Concerns (SoC)

To ensure a portfolio-ready codebase, the application logic is decoupled from the view layer.

- **Logic Layer**: Encapsulated in Custom Hooks. The UI components remain "dumb," only rendering data provided by the logic hooks.
- **Network Layer**: Centralized API handling with built-in error management and loading states.

### Resolved Technical Challenges

- **CORS Policy Resolution**: Implemented custom middleware configuration to handle cross-origin requests between the Vite dev server and the Express backend.
- **Port Conflict Handling**: Resolved recurring `403 Forbidden` errors on macOS by migrating the backend listener from the occupied Port 5000 to Port 5001.

## Installation and Setup

### 1. Prerequisites

- Docker Desktop
- Node.js (v18+)
- npm

### 2. Environment Setup

Configure a `.env` file in the `/server` directory:

```env
PORT=5001
DATABASE_URL="postgresql://user:password@localhost:5432/typewriter_db?schema=public"
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
