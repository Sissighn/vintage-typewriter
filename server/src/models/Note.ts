import { v4 as uuidv4 } from "uuid"; // Du musst evtl. 'npm install uuid' und 'npm install --save-dev @types/uuid' im server-ordner ausführen

/**
 * Kern-Modell für eine Notiz.
 * Auf Portfolio-Niveau nutzen wir private Felder und Getter/Setter (Kapselung).
 */
export class Note {
  private readonly _id: string;
  private _title: string;
  private _content: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(title: string, content: string) {
    this._id = uuidv4();
    this._title = title;
    this._content = content;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getter (wie in Java)
  public get id(): string {
    return this._id;
  }
  public get title(): string {
    return this._title;
  }
  public get content(): string {
    return this._content;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Setter mit integrierter Validierung
  public set title(newTitle: string) {
    if (newTitle.length === 0) throw new Error("Titel darf nicht leer sein.");
    this._title = newTitle;
    this.updateTimestamp();
  }

  public set content(newContent: string) {
    this._content = newContent;
    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  /**
   * Hilfsmethode, um das Objekt sauber in JSON umzuwandeln
   */
  public toJSON() {
    return {
      id: this._id,
      title: this._title,
      content: this._content,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      wordCount: this._content.split(/\s+/).length,
    };
  }
}
