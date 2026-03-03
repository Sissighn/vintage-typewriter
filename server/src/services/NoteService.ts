// server/src/services/NoteService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NoteService {
  /**
   * Erstellt eine neue Notiz und verknüpft sie mit der userId.
   * Das sorgt für die Einhaltung der relationalen Integrität.
   */
  async createNote(userId: string, title: string, content: string) {
    return await prisma.note.create({
      data: {
        title: title || "Untitled Manuscript",
        content,
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
      orderBy: { createdAt: "desc" },
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
