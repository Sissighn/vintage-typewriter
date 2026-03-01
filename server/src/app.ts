import express, { Application } from "express";
import dotenv from "dotenv";

dotenv.config();

/**
 * Die Hauptklasse für unseren Vintage-Typewriter-Server.
 * Diese Struktur ist modular und hochgradig wartbar.
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

  private initializeMiddlewares(): void {
    // Erlaubt uns, JSON-Daten im Request-Body zu empfangen
    this.app.use(express.json());
  }

  private initializeRoutes(): void {
    // Hier binden wir später unsere Routen ein
    this.app.get("/", (req, res) => {
      res.send("Der Vintage-Typewriter-Server ist bereit zum Tippen! ⌨️");
    });
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`--- Server läuft auf Port ${this.port} ---`);
    });
  }
}

// Instanziierung und Start des Servers
const server = new App(Number(process.env.PORT) || 5000);
server.listen();
