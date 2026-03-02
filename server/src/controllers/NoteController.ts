import { Request, Response } from "express";
import { NoteService } from "../services/NoteService";

export class NoteController {
  private readonly noteService: NoteService;

  constructor() {
    this.noteService = new NoteService();
  }

  public async addNote(req: Request, res: Response): Promise<void> {
    try {
      const { content, title } = req.body;
      const newNote = await this.noteService.createNote(content, title);
      res.status(201).json(newNote);
    } catch (error) {
      console.error("Failed to save note:", error);
      res.status(500).json({ error: "Failed to save note." });
    }
  }

  public async getAllNotes(_req: Request, res: Response): Promise<void> {
    try {
      const notes = await this.noteService.getAllNotes();
      res.json(notes);
    } catch (error) {
      console.error("Failed to load notes:", error);
      res.status(500).json({ error: "Failed to load notes." });
    }
  }

  public async deleteNote(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.noteService.deleteNote(id);
      res.status(200).json({ message: "Note deleted successfully." });
    } catch (error) {
      console.error("Failed to delete note:", error);
      res.status(500).json({ error: "Failed to delete note." });
    }
  }

  public async downloadNote(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const note = await this.noteService.getNoteById(id);

      if (!note) {
        res.status(404).send("Manuscript not found in archive.");
        return;
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${note.title}.txt"`,
      );
      res.setHeader("Content-Type", "text/plain");
      res.send(note.content);
    } catch (error) {
      console.error("Failed to download note:", error);
      res.status(500).send("Download failed.");
    }
  }
}
