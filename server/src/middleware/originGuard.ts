import { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function createOriginGuard(allowedOrigins: string[]) {
  const allowed = new Set(allowedOrigins);

  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    const origin = req.get("origin");

    if (!origin || !allowed.has(origin)) {
      res.status(403).json({ message: "Invalid request origin." });
      return;
    }

    next();
  };
}
