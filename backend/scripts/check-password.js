const argon2 = require("argon2");
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  try {
    const user = await p.user.findUnique({ where: { email: "admin@yckf.test" }});
    if (!user) { console.error("User not found"); process.exit(1); }
    const ok = await argon2.verify(user.password, "Admin#1234");
    console.log("argon2.verify result:", ok);
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await p.$disconnect();
  }
})();
