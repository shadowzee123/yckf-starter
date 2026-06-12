// src/routes/admin.ts (defensive/diagnostic version)
import express from "express";
import prisma from "../prisma/client";
import authenticate, { AuthRequest } from "../middlewares/auth"; // must be default export function
import requireRole from "../middlewares/requireRole"; // must be default export factory

const router = express.Router();

console.log("[ADMIN ROUTES] admin.ts module loaded");
console.log("[ADMIN ROUTES] authenticate type:", typeof authenticate);
console.log("[ADMIN ROUTES] requireRole type:", typeof requireRole);

// defensive checks with human-friendly errors
if (typeof authenticate !== "function") {
  console.error("[ADMIN ROUTES] ERROR: `authenticate` import is not a function (is it exported as default from src/middlewares/auth.ts?).");
  throw new Error("authenticate middleware is missing or not exported as default");
}
if (typeof requireRole !== "function") {
  console.error("[ADMIN ROUTES] ERROR: `requireRole` import is not a function (is it exported as default from src/middlewares/requireRole.ts?).");
  throw new Error("requireRole factory is missing or not exported as default");
}

// build role middleware from factory (now we will have an actual middleware fn)
const requireMasterAdmin = requireRole(["master_admin"]);
if (typeof requireMasterAdmin !== "function") {
  console.error("[ADMIN ROUTES] ERROR: requireRole(...) did not return a middleware function.");
  throw new Error("requireRole(...) did not return a middleware function");
}

console.log("[ADMIN ROUTES] router ready — will export. stack length:", (router as any).stack?.length);

// simple ping to confirm route is mounted
router.get("/ping", (_req, res) => res.json({ ok: true, file: "admin.ts loaded" }));

// only master_admin can access
router.get(
  "/users",
  authenticate,        // must be a function(req,res,next)
  requireMasterAdmin,  // middleware returned by requireRole(...)
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
          role: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(users);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Server error fetching users" });
    }
  }
);

router.delete(
  "/users/:id",
  authenticate,
  requireMasterAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (req.user?.id === id) {
        return res.status(400).json({ message: "You cannot delete your own admin account" });
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              enrollments: true,
              payments: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user._count.enrollments > 0 || user._count.payments > 0) {
        return res.status(409).json({
          message: "Cannot delete a user with enrollments or payments",
        });
      }

      await prisma.user.delete({ where: { id } });

      return res.status(204).send();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ message: "Server error deleting user" });
    }
  }
);

export default router;
