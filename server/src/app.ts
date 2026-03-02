import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import noteRoutes from "./routes/noteRoutes";

dotenv.config();

class App {
  public app: Application;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private initializeRoutes(): void {
    this.app.get("/", (_req, res) => {
      res.send("Vintage Typewriter server is ready! ⌨️");
    });

    this.app.use("/api/notes", noteRoutes);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`--- Server running on port ${this.port} ---`);
      console.log(
        `--- API ready at http://localhost:${this.port}/api/notes ---`,
      );
    });
  }
}

const server = new App(Number(process.env.PORT) || 5001);
server.listen();
