import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import noteRoutes from "./routes/noteRoutes";
import authRoutes from "./routes/authRoutes";
import { protect } from "./middleware/authMiddleware";

dotenv.config();

/**
 * Main Application Class
 * Handles initialization, middleware configuration, and route registration.
 * Optimized for secure JWT-based authentication via cookies.
 */
class App {
  public app: Application;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  /**
   * Configure global middlewares
   * Note: CORS must be configured with 'credentials: true' to allow cookies.
   */
  private initializeMiddlewares(): void {
    this.app.use(
      cors({
        origin: "http://localhost:5173", // Your Vite frontend URL
        credentials: true, // Crucial for sending/receiving HttpOnly cookies
      }),
    );
    this.app.use(express.json());
    this.app.use(cookieParser()); // Enables the server to parse cookies from requests
  }

  /**
   * Register API routes
   * Protected routes are secured via the 'protect' middleware.
   */
  private initializeRoutes(): void {
    // Health check / Welcome route
    this.app.get("/", (_req, res) => {
      res.send("Vintage Typewriter server is ready! // Secure Mode Active");
    });

    // Authentication Routes (Public)
    this.app.use("/api/auth", authRoutes);

    // Note Routes (Protected)
    // Only users with a valid JWT in their cookies can access these endpoints
    this.app.use("/api/notes", protect, noteRoutes);
  }

  /**
   * Start the server listener
   * Defaulting to Port 5001 to avoid MacOS AirPlay Receiver conflicts.
   */
  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`--- Server running on port ${this.port} ---`);
      console.log(`--- API protected by Argon2 & JWT Cookies ---`);
      console.log(`--- Ready for frontend at http://localhost:5173 ---`);
    });
  }
}

// Initialize and start the application
// Port 5001 is used to prevent the common MacOS Port 5000 conflict.
const server = new App(Number(process.env.PORT) || 5001);
server.listen();
