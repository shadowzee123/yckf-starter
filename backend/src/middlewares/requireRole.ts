import { Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "./auth";

export default function requireRole(allowedRoles: string[] = []) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
    if (!allowedRoles.length) return next();
    if (req.user.role && allowedRoles.includes(req.user.role)) return next();

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });

    const actualRole = user?.role?.name;
    if (actualRole && allowedRoles.includes(actualRole)) {
      req.user.role = actualRole;
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
}
