import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import noteRoutes from "./routes/noteRoutes";
import authRoutes from "./routes/authRoutes";
import { protect } from "./middleware/authMiddleware";
import { createOriginGuard } from "./middleware/originGuard";
import { env, isProduction } from "./config/env";

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
    const allowedOrigins = env.clientUrl
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    this.app.disable("x-powered-by");
    if (isProduction) {
      this.app.set("trust proxy", 1);
    }
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "same-site" },
        contentSecurityPolicy: isProduction
          ? {
              useDefaults: true,
              directives: {
                "default-src": ["'self'"],
                "frame-ancestors": ["'none'"],
              },
            }
          : false,
      }),
    );
    this.app.use(
      cors({
        origin(origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
          }

          callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
      }),
    );
    this.app.use(createOriginGuard(allowedOrigins));
    this.app.use(express.json({ limit: "32kb" }));
    this.app.use(cookieParser()); // Enables the server to parse cookies from requests
  }

  /**
   * Register API routes
   * Protected routes are secured via the 'protect' middleware.
   */
  private initializeRoutes(): void {
    this.app.get("/health", (_req, res) => {
      res.status(200).json({ status: "ok", service: "vintage-typewriter-api" });
    });

    // Welcome route
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
      console.log(`--- Ready for frontend at ${env.clientUrl} ---`);
    });
  }
}

// Initialize and start the application
// Port 5001 is used to prevent the common MacOS Port 5000 conflict.
const server = new App(env.port);
server.listen();
