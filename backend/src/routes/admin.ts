// src/routes/admin.ts (defensive/diagnostic version)
import express from "express";
import prisma from "../prisma/client";
import authenticate from "../middlewares/auth"; // must be default export function
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
     // src/routes/admin.ts (users route)
const page = Math.max(1, Number(req.query.page) || 1);
const limit = Math.min(100, Number(req.query.limit) || 20);
const skip = (page - 1) * limit;

const [users, total] = await Promise.all([
  prisma.user.findMany({
    skip,
    take: limit,
    select: { id: true, email: true, name: true, phone: true, createdAt: true, role: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  }),
  prisma.user.count()
]);

res.json({ page, limit, total, users });


    } catch (err: any) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Server error fetching users" });
    }
  }
);

export default router;
