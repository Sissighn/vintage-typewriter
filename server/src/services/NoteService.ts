// server/src/services/NoteService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NoteService {
  /**
   * Erstellt eine neue Notiz und verknüpft sie mit der userId.
   * Das sorgt für die Einhaltung der relationalen Integrität.
   */
  async createNote(
    userId: string,
    title: string,
    content: string,
    favorite = false,
  ) {
    return await prisma.note.create({
      data: {
        title: title || "Untitled Manuscript",
        content,
        favorite,
        // Hier ist die Lösung: Wir verknüpfen die Notiz mit dem User
        userId: userId,
      },
    });
  }

  /**
   * Holt nur die Notizen, die dem jeweiligen User gehören.
   */
  async getUserNotes(userId: string) {
    return await prisma.note.findMany({
      where: { userId },
      orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
    });
  }

  /**
   * Aktualisiert ein Manuskript, aber nur wenn es dem aktuellen User gehört.
   */
  async updateUserNote(
    id: string,
    userId: string,
    data: { title?: string; content?: string; favorite?: boolean },
  ) {
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existingNote) return null;

    return await prisma.note.update({
      where: { id },
      data: {
        ...(typeof data.title === "string" ? { title: data.title } : {}),
        ...(typeof data.content === "string" ? { content: data.content } : {}),
        ...(typeof data.favorite === "boolean"
          ? { favorite: data.favorite }
          : {}),
      },
    });
  }

  /**
   * Löscht eine Notiz, prüft aber vorher die Zugehörigkeit.
   */
  async deleteUserNote(id: string, userId: string) {
    return await prisma.note.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}
