import { Router } from "express";
import prisma from "../prisma/client";

const router = Router();

const faqs = [
  {
    keywords: ["phishing", "fake email", "scam link"],
    answer:
      "Phishing is a trick used to steal passwords or money. Do not click suspicious links, check the sender, and report the message.",
  },
  {
    keywords: ["password", "passcode", "login"],
    answer:
      "Use long unique passwords, store them in a password manager, and turn on multi-factor authentication wherever possible.",
  },
  {
    keywords: ["hacked", "compromised", "account stolen"],
    answer:
      "Change your password immediately, sign out other sessions, enable MFA, and contact platform support. Save screenshots as evidence.",
  },
  {
    keywords: ["certificate", "verify"],
    answer:
      "Use the certificate verification page and enter the verification code printed on the certificate.",
  },
  {
    keywords: ["premium", "donation", "payment"],
    answer:
      "Premium training unlocks after a valid donation between GHS 50-100 or USD 5-10 and a successful payment confirmation.",
  },
];

function answerQuestion(message: string) {
  const normalized = message.toLowerCase();
  const match = faqs.find((faq) => faq.keywords.some((keyword) => normalized.includes(keyword)));

  return (
    match?.answer ||
    "YCKF can help with phishing, passwords, hacked accounts, certificates, premium training, and cyber safety questions."
  );
}

router.post("/ask", async (req, res) => {
  try {
    const { platform = "web", userRef, message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const response = answerQuestion(String(message));

    await prisma.botLog.create({
      data: {
        platform: String(platform),
        userRef: userRef ? String(userRef) : null,
        message: String(message),
        response,
      },
    });

    return res.json({ response });
  } catch (err) {
    console.error("Bot ask error:", err);
    return res.status(500).json({ message: "Server error answering bot question" });
  }
});

router.get("/logs", async (_req, res) => {
  const logs = await prisma.botLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return res.json(logs);
});

export default router;
