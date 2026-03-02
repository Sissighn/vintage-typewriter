import { PrismaClient, Note } from "@prisma/client";

const prisma = new PrismaClient();

export class NoteService {
  /** Creates a new note in the database. */
  public async createNote(content: string, title?: string): Promise<Note> {
    return prisma.note.create({
      data: {
        content,
        title: title || `Manuscript from ${new Date().toLocaleDateString()}`,
      },
    });
  }

  /** Retrieves all notes, sorted by creation date (newest first). */
  public async getAllNotes(): Promise<Note[]> {
    return prisma.note.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /** Retrieves a single note by ID, or null if not found. */
  public async getNoteById(id: string): Promise<Note | null> {
    return prisma.note.findUnique({
      where: { id },
    });
  }

  /** Deletes a note by ID. */
  public async deleteNote(id: string): Promise<Note> {
    return prisma.note.delete({
      where: { id },
    });
  }
}
