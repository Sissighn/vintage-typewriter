import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  register,
  login,
  googleLogin,
  logout,
  getMe,
} from "../controllers/authController";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
