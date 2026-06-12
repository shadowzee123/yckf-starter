import { Router } from "express";
import prisma from "../prisma/client";
import authenticate, { AuthRequest } from "../middlewares/auth";
import requireRole from "../middlewares/requireRole";

const router = Router();
const requireCourseAdmin = requireRole(["master_admin", "secondary_admin"]);

router.get("/", async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          select: { id: true, title: true },
          orderBy: { title: "asc" },
        },
      },
      orderBy: { title: "asc" },
    });

    return res.json(courses);
  } catch (err) {
    console.error("List courses error:", err);
    return res.status(500).json({ message: "Server error listing courses" });
  }
});

router.post("/", authenticate, requireCourseAdmin, async (req, res) => {
  try {
    const { title, description, isPremium = false, lessons = [] } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Course title is required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        isPremium: Boolean(isPremium),
        lessons: {
          create: lessons.map((lesson: any) => ({
            title: lesson.title,
            content: lesson.content || "",
          })),
        },
      },
      include: { lessons: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "course.created",
        actorId: (req as AuthRequest).user?.id,
        meta: JSON.stringify({ courseId: course.id, title: course.title }),
      },
    });

    return res.status(201).json(course);
  } catch (err) {
    console.error("Create course error:", err);
    return res.status(500).json({ message: "Server error creating course" });
  }
});

router.put("/:id", authenticate, requireCourseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPremium } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isPremium !== undefined ? { isPremium: Boolean(isPremium) } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "course.updated",
        actorId: (req as AuthRequest).user?.id,
        meta: JSON.stringify({ courseId: course.id }),
      },
    });

    return res.json(course);
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Course not found" });
    }

    console.error("Update course error:", err);
    return res.status(500).json({ message: "Server error updating course" });
  }
});

router.delete("/:id", authenticate, requireCourseAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const counts = await prisma.course.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            enrollments: true,
            payments: true,
          },
        },
      },
    });

    if (!counts) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (counts._count.enrollments > 0 || counts._count.payments > 0) {
      return res.status(409).json({ message: "Cannot delete a course with enrollments or payments" });
    }

    await prisma.lesson.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "course.deleted",
        actorId: (req as AuthRequest).user?.id,
        meta: JSON.stringify({ courseId: id }),
      },
    });

    return res.status(204).send();
  } catch (err) {
    console.error("Delete course error:", err);
    return res.status(500).json({ message: "Server error deleting course" });
  }
});

router.post("/:id/enroll", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.isPremium) {
      const paid = await prisma.payment.findFirst({
        where: { userId, courseId: id, status: "success" },
      });

      if (!paid) {
        return res.status(402).json({ message: "Premium course requires successful donation payment" });
      }
    }

    const existing = await prisma.enrollment.findFirst({
      where: { userId, courseId: id },
      include: { course: true, certificate: true },
    });

    if (existing) {
      return res.json(existing);
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId: id, progress: 0 },
      include: { course: true, certificate: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "course.enrolled",
        actorId: userId,
        meta: JSON.stringify({ courseId: id, enrollmentId: enrollment.id }),
      },
    });

    return res.status(201).json(enrollment);
  } catch (err) {
    console.error("Enroll error:", err);
    return res.status(500).json({ message: "Server error enrolling course" });
  }
});

export default router;
