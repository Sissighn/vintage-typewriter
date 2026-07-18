import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { AuthRequest } from "../middleware/authMiddleware";
import { env } from "../config/env";
import { clearAuthCookie, setAuthCookie } from "../config/cookies";

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(env.googleClientId);

const passwordSchema = z
  .string()
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/);

const emailSchema = z.string().email().transform((email) => email.toLowerCase());

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(256),
});

const googleLoginSchema = z.object({
  idToken: z.string().min(20).max(5000),
});

// Token helper: Creates a signed JWT valid for 24 hours
const createToken = (userId: string) => {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: "24h",
  });
};

/**
 * Register a new user using Email and Password
 */
// Ergänzung in der register-Funktion:
export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "INVALID REGISTRATION DATA.",
      });
    }
    const { email, password, name } = parsed.data;

    // 2. Prüfen, ob User existiert
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "EMAIL ALREADY IN USE." });
    }

    // 3. Passwort hashen und User erstellen
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const token = createToken(user.id);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "USER REGISTERED SUCCESSFULLY",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ message: "REGISTRATION FAILED." });
  }
};

/**
 * Login with Email and Password
 */
export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const { email, password } = parsed.data;

    // 1. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Verify the hashed password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Set session cookie
    const token = createToken(user.id);
    setAuthCookie(res, token);

    res.json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

/**
 * Handle Google OAuth Sign-In
 */
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const parsed = googleLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid Google token" });
    }
    const { idToken } = parsed.data;

    // 1. Verify the Google Token with Google's API
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    if (!payload.email_verified) {
      return res.status(403).json({
        message: "Google account email is not verified.",
      });
    }

    const email = payload.email.toLowerCase();

    // 2. Find by Google ID first. This is the strongest account binding.
    let user = await prisma.user.findUnique({
      where: { googleId: payload.sub },
    });

    if (user && user.email !== email) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name: payload.name || user.name,
          avatar: payload.picture || user.avatar,
        },
      });
    }

    if (!user) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmailUser) {
        if (existingEmailUser.googleId && existingEmailUser.googleId !== payload.sub) {
          return res.status(409).json({
            message: "This email is already linked to another Google account.",
          });
        }

        if (!existingEmailUser.googleId) {
          return res.status(409).json({
            message:
              "This email already has a password account. Sign in with email first before linking Google.",
          });
        }
      }

      user = await prisma.user.create({
        data: {
          email,
          name: payload.name,
          googleId: payload.sub,
          avatar: payload.picture,
        },
      });
    }

    // 3. Set session cookie
    const token = createToken(user.id);
    setAuthCookie(res, token);

    res.json({
      message: "Google login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Google authentication failed" });
  }
};

/**
 * Logout and clear the secure cookie
 */
export const logout = (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully" });
};

/**
 * Returns the currently authenticated user's data.
 * This allows the frontend to persist sessions on refresh.
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, avatar: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
