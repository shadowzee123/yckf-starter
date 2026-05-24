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

// Default export *must* be a function so import ... from '../middlewares/auth' works
export default function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const auth = (req.headers.authorization || req.headers.Authorization) as string | undefined;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = auth.split(" ")[1];
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId: string = payload.userId || payload.sub || null;
    const roleName: string | undefined = payload.role || payload.roleName || undefined;
    if (!userId) return res.status(401).json({ message: "Invalid token payload" });

    req.user = { id: userId, role: roleName };
    next();
  } catch (e) {
    console.error("authenticate middleware error:", e);
    res.status(500).json({ message: "Server error" });
  }
}
