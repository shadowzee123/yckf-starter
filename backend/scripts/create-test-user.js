const argon2 = require("argon2");
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  try {
    const hashed = await argon2.hash("testpass123");
    const role = await p.role.findUnique({ where: { name: "student" }});
    const u = await p.user.upsert({
      where: { email: "student-test@yckf.test" },
      update: { password: hashed, name: "Student Test", roleId: role ? role.id : undefined },
      create: { email: "student-test@yckf.test", password: hashed, name: "Student Test", roleId: role ? role.id : undefined }
    });
    console.log("Created/updated user:", u.email);
  } catch(e) { console.error(e) } finally { await p.$disconnect(); }
})();
