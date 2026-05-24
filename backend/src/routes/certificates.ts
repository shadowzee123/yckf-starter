import { Router } from "express";
import prisma from "../prisma/client";
import QRCode from "qrcode";

const router = Router();

function escapeHtml(value: string | null | undefined) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getCertificate(code: string) {
  return prisma.certificate.findUnique({
    where: { verifyCode: code },
    include: {
      enrollment: {
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          course: true,
        },
      },
    },
  });
}

router.get("/verify/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await getCertificate(code);

    if (!certificate) {
      return res.status(404).json({ valid: false, message: "Certificate not found" });
    }

    return res.json({
      valid: true,
      verifyCode: certificate.verifyCode,
      issuedAt: certificate.createdAt,
      student: certificate.enrollment.user,
      course: {
        id: certificate.enrollment.course.id,
        title: certificate.enrollment.course.title,
      },
    });
  } catch (err) {
    console.error("Certificate verify error:", err);
    return res.status(500).json({ message: "Server error verifying certificate" });
  }
});

router.get("/:code/print", async (req, res) => {
  try {
    const { code } = req.params;
    const certificate = await getCertificate(code);

    if (!certificate) {
      return res.status(404).send("Certificate not found");
    }

    const verifyUrl = `${req.protocol}://${req.get("host")}/api/certificates/verify/${encodeURIComponent(code)}`;
    const qrCode = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 180,
      color: {
        dark: "#064e3b",
        light: "#ffffff",
      },
    });
    const studentName = certificate.enrollment.user.name || certificate.enrollment.user.email;
    const issuedAt = new Date(certificate.createdAt).toLocaleDateString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>YCKF Certificate - ${escapeHtml(code)}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: #e2e8f0;
      color: #0f172a;
      font-family: Arial, Helvetica, sans-serif;
    }
    .page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .certificate {
      width: min(1120px, 100%);
      min-height: 700px;
      background: #fff;
      border: 14px solid #064e3b;
      outline: 2px solid #10b981;
      padding: 52px;
      position: relative;
    }
    .topline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 24px;
    }
    .brand { display: flex; align-items: center; gap: 16px; }
    .mark {
      width: 64px; height: 64px; background: #064e3b; color: white;
      display: grid; place-items: center; font-weight: 900; font-size: 22px;
    }
    .brand h1 { margin: 0; font-size: 20px; letter-spacing: .14em; text-transform: uppercase; }
    .brand p { margin: 5px 0 0; color: #64748b; font-size: 13px; font-weight: 700; }
    .verify { text-align: right; font-size: 12px; color: #475569; }
    .content { text-align: center; padding: 54px 24px 28px; }
    .eyebrow { color: #047857; font-size: 13px; font-weight: 900; letter-spacing: .24em; text-transform: uppercase; }
    .title { margin: 16px 0 8px; font-family: Georgia, serif; font-size: 58px; line-height: 1; color: #064e3b; }
    .presented { margin-top: 28px; color: #475569; font-size: 17px; }
    .student { margin: 14px auto 0; max-width: 760px; border-bottom: 2px solid #064e3b; padding-bottom: 12px; font-family: Georgia, serif; font-size: 42px; font-weight: 700; }
    .copy { margin: 26px auto 0; max-width: 780px; color: #334155; font-size: 18px; line-height: 1.7; }
    .course { color: #064e3b; font-weight: 900; }
    .bottom {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: end;
      gap: 32px;
      margin-top: 46px;
    }
    .signature { border-top: 1px solid #0f172a; padding-top: 10px; font-size: 13px; font-weight: 800; color: #334155; }
    .qr { text-align: center; font-size: 11px; color: #475569; }
    .qr img { width: 136px; height: 136px; }
    .print { position: fixed; right: 18px; top: 18px; border: 0; background: #064e3b; color: white; padding: 12px 16px; font-weight: 900; cursor: pointer; }
    @media print {
      body { background: white; }
      .page { padding: 0; min-height: auto; }
      .certificate { width: 100%; min-height: auto; box-shadow: none; }
      .print { display: none; }
    }
  </style>
</head>
<body>
  <button class="print" onclick="window.print()">Save / Print PDF</button>
  <main class="page">
    <section class="certificate">
      <div class="topline">
        <div class="brand">
          <div class="mark">YK</div>
          <div>
            <h1>Young Cyber Knights Foundation</h1>
            <p>Cybersecurity Training Certificate</p>
          </div>
        </div>
        <div class="verify">
          <strong>Verification Code</strong><br />
          ${escapeHtml(code)}
        </div>
      </div>
      <div class="content">
        <div class="eyebrow">Certificate of Completion</div>
        <div class="title">Certificate</div>
        <div class="presented">This certificate is proudly presented to</div>
        <div class="student">${escapeHtml(studentName)}</div>
        <p class="copy">
          for successfully completing <span class="course">${escapeHtml(certificate.enrollment.course.title)}</span>
          through the Young Cyber Knights Foundation cybersecurity training platform.
        </p>
      </div>
      <div class="bottom">
        <div class="signature">Issued on ${escapeHtml(issuedAt)}</div>
        <div class="qr">
          <img src="${qrCode}" alt="Certificate verification QR code" />
          <div>Scan to verify</div>
        </div>
        <div class="signature">YCKF Program Director</div>
      </div>
    </section>
  </main>
</body>
</html>`);
  } catch (err) {
    console.error("Certificate print error:", err);
    return res.status(500).send("Server error rendering certificate");
  }
});

export default router;
