import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/crypto";

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Token helper: Creates a signed JWT valid for 24 hours
const createToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "24h",
  });
};

// Cookie helper: Sets a secure HttpOnly cookie
const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Register a new user using Email and Password
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 2. Hash the password securely with Argon2 + Pepper
    const passwordHash = await hashPassword(password);

    // 3. Create the user in database
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // 4. Generate token and set cookie
    const token = createToken(user.id);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

/**
 * Login with Email and Password
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

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
    const { idToken } = req.body;

    // 1. Verify the Google Token with Google's API
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    // 2. Find or create the user in our database
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
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
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
