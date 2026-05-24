import { Router } from "express";
import prisma from "../prisma/client";
import authenticate, { AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/dashboard", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              select: { id: true, title: true },
              orderBy: { title: "asc" },
            },
          },
        },
        certificate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const completed = enrollments.filter((item) => item.progress >= 100).length;
    const averageProgress = enrollments.length
      ? Math.round(enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length)
      : 0;

    return res.json({
      stats: {
        enrolledCourses: enrollments.length,
        averageProgress,
        certificates: completed,
      },
      enrollments,
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    return res.status(500).json({ message: "Server error loading dashboard" });
  }
});

router.patch("/enrollments/:id/progress", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const progress = Number(req.body.progress);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Progress must be between 0 and 100" });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { id, userId },
      include: { certificate: true, course: true },
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: { progress },
      include: { course: true, certificate: true },
    });

    if (progress >= 100 && !updated.certificate) {
      const verifyCode = `YCKF-${Date.now()}-${id.slice(0, 6).toUpperCase()}`;

      const certificate = await prisma.certificate.create({
        data: {
          enrollmentId: id,
          verifyCode,
          url: `/verify?code=${encodeURIComponent(verifyCode)}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "certificate.generated",
          actorId: userId,
          meta: JSON.stringify({ enrollmentId: id, certificateId: certificate.id, verifyCode }),
        },
      });

      return res.json({ ...updated, certificate });
    }

    return res.json(updated);
  } catch (err) {
    console.error("Progress update error:", err);
    return res.status(500).json({ message: "Server error updating progress" });
  }
});

export default router;
