import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

// Load .env.local
const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
envLocal.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
});

const newEmail = process.argv[2];
const newPassword = process.argv[3];
const newName = process.argv[4] || 'Academy Admin';

async function updateAdminCredentials() {
  if (!newEmail || !newPassword) {
    console.log('\nUsage: npx tsx scripts/update-admin.ts <newEmail> <newPassword> [newName]\n');
    console.log('Example: npx tsx scripts/update-admin.ts admin@myacademy.com Password123! "Head Admin"');
    process.exit(1);
  }

  console.log(`Updating admin account credentials...`);

  // Find admin user
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });

  if (!adminUser) {
    console.error('❌ Admin user not found in database.');
    process.exit(1);
  }

  // Hash new password with bcrypt
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Update user in PostgreSQL
  await prisma.$transaction([
    prisma.user.update({
      where: { id: adminUser.id },
      data: { email: newEmail.toLowerCase(), name: newName },
    }),
    prisma.userPassword.upsert({
      where: { userId: adminUser.id },
      create: { userId: adminUser.id, hash: passwordHash },
      update: { hash: passwordHash },
    }),
  ]);

  // Update data/academy_db.json fallback
  const jsonPath = path.join(process.cwd(), 'data', 'academy_db.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const uIdx = data.users.findIndex((u: any) => u.role === 'admin' || u.id === adminUser.id);
    if (uIdx !== -1) {
      data.users[uIdx].email = newEmail.toLowerCase();
      data.users[uIdx].name = newName;
    }
    if (!data.passwords) data.passwords = {};
    data.passwords[adminUser.id] = passwordHash;
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  }

  console.log(`✅ SUCCESS! Admin credentials updated:`);
  console.log(`- Email: ${newEmail.toLowerCase()}`);
  console.log(`- Name: ${newName}`);
  console.log(`- Password: (Updated & Bcrypt Hashed)`);
  process.exit(0);
}

updateAdminCredentials();
