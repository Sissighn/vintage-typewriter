import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NoteService {
  /**
   * Erstellt eine neue Notiz in der Datenbank.
   */
  public async createNote(content: string, title?: string) {
    return await prisma.note.create({
      data: {
        content,
        title: title || "Manuskript vom " + new Date().toLocaleDateString(),
      },
    });
  }

  /**
   * Holt alle Notizen, sortiert nach Datum.
   */
  public async getAllNotes() {
    return await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Löscht eine Notiz anhand ihrer ID.
   */
  public async deleteNote(id: string) {
    return await prisma.note.delete({
      where: { id },
    });
  }
}
