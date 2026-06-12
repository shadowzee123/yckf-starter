import { Router } from "express";
import QRCode from "qrcode";
import prisma from "../prisma/client";

const router = Router();

function escapeHtml(value: string | null | undefined) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getCertificate(code: string) {
  return prisma.certificate.findUnique({
    where: { verifyCode: code },
    include: { enrollment: { include: { user: { select: { id: true, email: true, name: true } }, course: true } } },
  });
}

router.get("/verify/:code", async (req, res) => {
  const certificate = await getCertificate(req.params.code);
  if (!certificate) return res.status(404).json({ valid: false, message: "Certificate not found" });

  return res.json({
    valid: true,
    verifyCode: certificate.verifyCode,
    issuedAt: certificate.createdAt,
    student: certificate.enrollment.user,
    course: { id: certificate.enrollment.course.id, title: certificate.enrollment.course.title },
  });
});

router.get("/:code/print", async (req, res) => {
  const certificate = await getCertificate(req.params.code);
  if (!certificate) return res.status(404).send("Certificate not found");

  const verifyUrl = `${req.protocol}://${req.get("host")}/api/certificates/verify/${encodeURIComponent(req.params.code)}`;
  const qrCode = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 180 });
  const studentName = certificate.enrollment.user.name || certificate.enrollment.user.email;
  const issuedAt = new Date(certificate.createdAt).toLocaleDateString();

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(`<!doctype html><html><head><title>YCKF Certificate</title><style>
    body{margin:0;background:#e2e8f0;font-family:Arial,sans-serif;color:#0f172a}.page{min-height:100vh;display:grid;place-items:center;padding:24px}
    .cert{max-width:1100px;width:100%;min-height:680px;background:white;border:14px solid #064e3b;padding:52px;text-align:center}
    .brand{display:flex;justify-content:space-between;border-bottom:1px solid #cbd5e1;padding-bottom:24px;text-align:left}.mark{background:#064e3b;color:white;padding:18px;font-weight:900;display:inline-block}
    .title{font-family:Georgia,serif;font-size:60px;color:#064e3b;margin:50px 0 20px}.name{font-family:Georgia,serif;font-size:42px;font-weight:700;border-bottom:2px solid #064e3b;display:inline-block;padding:0 60px 12px}
    .copy{font-size:18px;line-height:1.7}.bottom{display:flex;justify-content:space-between;align-items:end;margin-top:48px}.qr img{width:136px}.print{position:fixed;right:18px;top:18px;background:#064e3b;color:white;border:0;padding:12px 16px;font-weight:900}
    @media print{.print{display:none}body{background:white}.page{padding:0}.cert{max-width:none;min-height:auto}}
  </style></head><body><button class="print" onclick="window.print()">Save / Print PDF</button><main class="page"><section class="cert">
    <div class="brand"><div><span class="mark">YK</span><h1>Young Cyber Knights Foundation</h1><p>Cybersecurity Training Certificate</p></div><div>Verification Code<br><strong>${escapeHtml(req.params.code)}</strong></div></div>
    <div class="title">Certificate</div><p>This certificate is proudly presented to</p><div class="name">${escapeHtml(studentName)}</div>
    <p class="copy">for successfully completing <strong>${escapeHtml(certificate.enrollment.course.title)}</strong>.</p>
    <div class="bottom"><div>Issued on ${escapeHtml(issuedAt)}</div><div class="qr"><img src="${qrCode}" alt="QR code"><div>Scan to verify</div></div><div>YCKF Program Director</div></div>
  </section></main></body></html>`);
});

export default router;
