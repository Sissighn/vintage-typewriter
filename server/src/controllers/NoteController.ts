import { Request, Response } from "express";
import { NoteService } from "../services/NoteService";

const noteService = new NoteService();

// Wir definieren hier ein lokales Interface, das exakt zu deiner Note-Klasse
// und deiner Datenbank passt. Das löst alle "implicitly any" Fehler sofort.
interface INote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class NoteController {
  public async addNote(req: Request, res: Response): Promise<void> {
    try {
      const { content, title } = req.body;
      const newNote = await noteService.createNote(content, title);
      res.status(201).json(newNote);
    } catch (error) {
      res.status(500).json({ error: "Failed to save note." });
    }
  }

  public async getAllNotes(req: Request, res: Response): Promise<void> {
    try {
      const notes: INote[] =
        (await noteService.getAllNotes()) as unknown as INote[];
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to load notes." });
    }
  }

  public async deleteNote(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await noteService.deleteNote(id);
      res.status(200).json({ message: "Note deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note." });
    }
  }

  public async downloadNote(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const notes: INote[] =
        (await noteService.getAllNotes()) as unknown as INote[];

      const note = notes.find((n: INote) => n.id === id);

      if (!note) {
        res.status(404).send("Manuscript not found in archive.");
        return;
      }

      // Wir nutzen hier die Daten des gefundenen Objekts
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${note.title}.txt"`,
      );
      res.setHeader("Content-Type", "text/plain");
      res.send(note.content);
    } catch (error) {
      res.status(500).send("Download failed.");
    }
  }
}
