import { Router } from "express";
import { NoteController } from "../controllers/NoteController";

const router = Router();
const noteController = new NoteController();

router.post("/", (req, res) => noteController.addNote(req, res));
router.get("/", (req, res) => noteController.getAllNotes(req, res));
router.delete("/:id", (req, res) => noteController.deleteNote(req, res));
router.get("/:id/download", (req, res) =>
  noteController.downloadNote(req, res),
);

export default router;
