// scripts/create-admin.js
const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async function createAdmin(){
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@yckf.test';
    const password = process.env.ADMIN_PASS || 'Admin#1234';
    const name = process.env.ADMIN_NAME || 'Master Admin';

    const hashed = await argon2.hash(password);

    const role = await prisma.role.findUnique({ where: { name: 'master_admin' }});
    if (!role) {
      throw new Error('master_admin role not found. Run prisma/seed.js first.');
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashed, name, roleId: role.id },
      create: { email, password: hashed, name, roleId: role.id }
    });

    console.log('Master admin created/updated:', user.email);
  } catch (e) {
    console.error('Admin creation error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
