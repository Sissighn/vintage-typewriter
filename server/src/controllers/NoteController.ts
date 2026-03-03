import { Response } from "express";
import { NoteService } from "../services/NoteService";
import { AuthRequest } from "../middleware/authMiddleware"; //

export class NoteController {
  private readonly noteService: NoteService;

  constructor() {
    this.noteService = new NoteService();
  }

  /**
   * Erstellt ein neues Manuskript für den aktuell eingeloggten User.
   */
  public async addNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { content, title } = req.body;

      // Wir übergeben die userId als ersten Parameter, wie im Service definiert
      const newNote = await this.noteService.createNote(
        req.userId!,
        title,
        content,
      );

      res.status(201).json(newNote);
    } catch (error) {
      console.error("Failed to save note:", error);
      res.status(500).json({ error: "Failed to save note." });
    }
  }

  /**
   * Lädt alle Notizen, aber nur die des aktuellen Benutzers.
   */
  public async getAllNotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Wir nutzen die neue Service-Methode für user-spezifische Notizen
      const notes = await this.noteService.getUserNotes(req.userId!);
      res.json(notes);
    } catch (error) {
      console.error("Failed to load notes:", error);
      res.status(500).json({ error: "Failed to load notes." });
    }
  }

  /**
   * Löscht eine Notiz, sofern sie dem User gehört.
   */
  public async deleteNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      // Wir übergeben ID und userId für die Sicherheitsprüfung
      await this.noteService.deleteUserNote(id, req.userId!);

      res.status(200).json({ message: "Note deleted successfully." });
    } catch (error) {
      console.error("Failed to delete note:", error);
      res.status(500).json({ error: "Failed to delete note." });
    }
  }

  /**
   * Erlaubt den Download eines Manuskripts als .txt Datei.
   */
  public async downloadNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      // Für den Download holen wir alle Notizen des Users und suchen die richtige raus
      const notes = await this.noteService.getUserNotes(req.userId!);
      const note = notes.find((n) => n.id === id);

      if (!note) {
        res.status(404).send("Manuscript not found in your archive.");
        return;
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${note.title || "Manuscript"}.txt"`,
      );
      res.setHeader("Content-Type", "text/plain");
      res.send(note.content);
    } catch (error) {
      console.error("Failed to download note:", error);
      res.status(500).send("Download failed.");
    }
  }
}
