import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function upsertCourse(title: string, description: string, isPremium: boolean, lessons: string[]) {
  let course = await prisma.course.findFirst({
    where: { title },
  });

  if (course) {
    course = await prisma.course.update({
      where: { id: course.id },
      data: { description, isPremium },
    });
  } else {
    course = await prisma.course.create({
      data: { title, description, isPremium },
    });
  }

  for (const lessonTitle of lessons) {
    const existing = await prisma.lesson.findFirst({
      where: { courseId: course.id, title: lessonTitle },
    });

    if (!existing) {
      await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: lessonTitle,
          content: `${lessonTitle} learning material for ${title}.`,
        },
      });
    }
  }

  return course;
}

async function main() {
  const [studentRole, masterRole, secondaryRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "student" },
      update: {},
      create: { name: "student" },
    }),
    prisma.role.upsert({
      where: { name: "master_admin" },
      update: {},
      create: { name: "master_admin" },
    }),
    prisma.role.upsert({
      where: { name: "secondary_admin" },
      update: {},
      create: { name: "secondary_admin" },
    }),
  ]);

  const [adminPassword, studentPassword, secondaryPassword] = await Promise.all([
    argon2.hash("Admin#1234"),
    argon2.hash("Student#1234"),
    argon2.hash("Secondary#1234"),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@yckf.test" },
    update: { password: adminPassword, name: "Master Admin", roleId: masterRole.id },
    create: {
      email: "admin@yckf.test",
      password: adminPassword,
      name: "Master Admin",
      roleId: masterRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "secondary@yckf.test" },
    update: { password: secondaryPassword, name: "Secondary Admin", roleId: secondaryRole.id },
    create: {
      email: "secondary@yckf.test",
      password: secondaryPassword,
      name: "Secondary Admin",
      roleId: secondaryRole.id,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@yckf.test" },
    update: { password: studentPassword, name: "Student Demo", roleId: studentRole.id },
    create: {
      email: "student@yckf.test",
      password: studentPassword,
      name: "Student Demo",
      roleId: studentRole.id,
    },
  });

  const cyberBasics = await upsertCourse(
    "Cyber Hygiene Basics",
    "Passwords, device safety, privacy settings, and everyday cyber protection habits.",
    false,
    ["Account safety", "Device updates", "Privacy settings"]
  );

  await upsertCourse(
    "Phishing Awareness",
    "Spot scam emails, fake websites, social engineering tricks, and unsafe links.",
    false,
    ["Phishing red flags", "Reporting suspicious messages"]
  );

  const premium = await upsertCourse(
    "Ethical Hacking Foundation",
    "Responsible security testing basics, lab practice, and vulnerability reporting.",
    true,
    ["Reconnaissance basics", "Vulnerability reports", "Ethics and disclosure"]
  );

  await prisma.payment.upsert({
    where: { id: "seed-payment-premium-001" },
    update: {},
    create: {
      id: "seed-payment-premium-001",
      userId: student.id,
      courseId: premium.id,
      amount: 50,
      currency: "GHS",
      provider: "seed",
      providerPaymentId: "seed-payment-premium-001",
      status: "success",
    },
  });

  const enrollment = await prisma.enrollment.upsert({
    where: { id: "seed-enrollment-cyber-basics" },
    update: { progress: 100 },
    create: {
      id: "seed-enrollment-cyber-basics",
      userId: student.id,
      courseId: cyberBasics.id,
      progress: 100,
    },
  });

  await prisma.certificate.upsert({
    where: { verifyCode: "YCKF-CERT-DEMO-001" },
    update: {},
    create: {
      enrollmentId: enrollment.id,
      verifyCode: "YCKF-CERT-DEMO-001",
      url: "/verify?code=YCKF-CERT-DEMO-001",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "database.seeded",
      actorId: admin.id,
      meta: JSON.stringify({ source: "prisma/seed.ts" }),
    },
  });

  console.log("YCKF demo data seeded successfully.");
  console.log("Master Admin: admin@yckf.test / Admin#1234");
  console.log("Secondary Admin: secondary@yckf.test / Secondary#1234");
  console.log("Student: student@yckf.test / Student#1234");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
