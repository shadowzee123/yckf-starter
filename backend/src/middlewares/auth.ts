import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export interface AuthUser {
  id: string;
  role?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export default function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload: any = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    const userId = payload.userId || payload.sub;

    if (!userId) return res.status(401).json({ message: "Invalid token payload" });

    req.user = { id: userId, role: payload.role || payload.roleName };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
