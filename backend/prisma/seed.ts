import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter } as any);

async function hashPw(pw: string) {
  return argon.hash(pw);
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── ADMIN ──────────────────────────────────────────────
  const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        code: 'AD001',
        password: await hashPw('123456'),
        fullName: 'Administrator',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('  ✔ Admin created  (AD001 / 123456)');
  } else {
    console.log('  – Admin already exists, skipped');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
