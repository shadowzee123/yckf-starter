import { Router } from "express";
import prisma from "../prisma/client";
import authenticate, { AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/dashboard", authenticate, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: { include: { lessons: true } }, certificate: true },
    orderBy: { createdAt: "desc" },
  });
  const averageProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum: number, item: { progress: number }) => sum + item.progress, 0) / enrollments.length)
    : 0;

  return res.json({
    stats: {
      enrolledCourses: enrollments.length,
      averageProgress,
      certificates: enrollments.filter((item: { certificate?: unknown }) => item.certificate).length,
    },
    enrollments,
  });
});

router.patch("/enrollments/:id/progress", authenticate, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const progress = Number(req.body.progress);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return res.status(400).json({ message: "Progress must be between 0 and 100" });
  }

  const enrollment = await prisma.enrollment.findFirst({ where: { id: req.params.id, userId }, include: { certificate: true } });
  if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

  const updated = await prisma.enrollment.update({
    where: { id: req.params.id },
    data: { progress },
    include: { course: true, certificate: true },
  });

  if (progress >= 100 && !updated.certificate) {
    const verifyCode = `YCKF-${Date.now()}-${req.params.id.slice(0, 6).toUpperCase()}`;
    const certificate = await prisma.certificate.create({
      data: { enrollmentId: req.params.id, verifyCode, url: `/verify?code=${verifyCode}` },
    });
    return res.json({ ...updated, certificate });
  }

  return res.json(updated);
});

export default router;
