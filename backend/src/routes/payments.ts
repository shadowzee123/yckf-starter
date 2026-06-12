import { Router } from "express";
import prisma from "../prisma/client";
import authenticate, { AuthRequest } from "../middlewares/auth";
import { validateDonation } from "../services/paymentValidation";

const router = Router();

router.post("/demo-donation", authenticate, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { courseId, amount, currency, provider = "demo" } = req.body;
  const normalizedCurrency = String(currency || "").toUpperCase() as "GHS" | "USD";
  const numericAmount = Number(amount);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!courseId || !Number.isFinite(numericAmount)) {
    return res.status(400).json({ message: "courseId and numeric amount are required" });
  }

  const validation = validateDonation(numericAmount, normalizedCurrency);
  if (!validation.allowed) {
    return res.status(validation.reason === "above_max" ? 422 : 402).json({
      message:
        validation.reason === "below_min"
          ? "Donation is below the minimum required for premium access"
          : "Donation is above the allowed maximum",
      reason: validation.reason,
    });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (!course.isPremium) return res.status(400).json({ message: "This course does not require a premium donation" });

  const payment = await prisma.payment.create({
    data: {
      userId,
      courseId,
      amount: numericAmount,
      currency: normalizedCurrency,
      provider,
      providerPaymentId: `${provider}-${userId}-${courseId}-${Date.now()}`,
      status: "success",
    },
  });

  const existing = await prisma.enrollment.findFirst({ where: { userId, courseId }, include: { course: true, certificate: true } });
  const enrollment =
    existing ||
    (await prisma.enrollment.create({ data: { userId, courseId, progress: 0 }, include: { course: true, certificate: true } }));

  await prisma.auditLog.create({
    data: { action: "payment.demo_donation_success", actorId: userId, meta: JSON.stringify({ paymentId: payment.id, courseId }) },
  });

  return res.status(201).json({ message: "Donation accepted and premium course unlocked", payment, enrollment });
});

export default router;
