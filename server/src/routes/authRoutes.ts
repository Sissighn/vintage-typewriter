import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  register,
  login,
  googleLogin,
  logout,
  getMe,
} from "../controllers/authController";
import {
  authRateLimiter,
  registrationRateLimiter,
} from "../middleware/rateLimiters";

const router = Router();

// Public routes
router.post("/register", registrationRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/google", authRateLimiter, googleLogin);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
