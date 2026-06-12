const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const user = await p.user.findUnique({
      where: { email: "admin@yckf.test" },
      include: { role: true }
    });
    console.log("USER:", JSON.stringify(user, null, 2));
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await p.$disconnect();
  }
})();
