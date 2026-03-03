import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Express Request type to include the userId
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Protect middleware: Verifies the JWT in the HttpOnly cookie.
 * Use this for any route that requires a logged-in user.
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token found" });
  }

  try {
    // Verify the JWT token using your secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    // Attach the userId to the request for the next handler
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
