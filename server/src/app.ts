import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors"; // Installiere dies mit 'npm install cors @types/cors'
import { NoteController } from "./controllers/NoteController";

dotenv.config();

class App {
  public app: Application;
  public port: number;
  private noteController: NoteController;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.noteController = new NoteController();

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors()); // Erlaubt deinem Frontend den Zugriff auf das Backend
    this.app.use(express.json());
  }

  // In server/src/app.ts
  private initializeRoutes(): void {
    this.app.get("/", (req, res) => {
      res.send("Der Vintage-Typewriter-Server ist bereit! ⌨️");
    });

    // Wichtig: (req, res) => this.noteController.METHODE(req, res)
    this.app.post("/api/notes", (req, res) =>
      this.noteController.addNote(req, res),
    );
    this.app.get("/api/notes", (req, res) =>
      this.noteController.getAllNotes(req, res),
    );
    this.app.delete("/api/notes/:id", (req, res) =>
      this.noteController.deleteNote(req, res),
    );
    this.app.get("/api/notes/:id/download", (req, res) =>
      this.noteController.downloadNote(req, res),
    );
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`--- Server läuft auf Port ${this.port} ---`);
      console.log(
        `--- API bereit unter http://localhost:${this.port}/api/notes ---`,
      );
    });
  }
}

const server = new App(Number(process.env.PORT) || 5000);
server.listen();
