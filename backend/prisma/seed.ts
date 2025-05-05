import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
    },
  });
  
  console.log('Admin user created:', admin);
  
  // Create default settings
  const defaultSettings = [
    { key: 'theme', value: 'light' },
    { key: 'refreshInterval', value: '30' },
    { key: 'maxPeersToShow', value: '100' },
    { key: 'maxTransactionsToShow', value: '50' },
  ];
  
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: {
        key: setting.key,
        value: setting.value,
      },
    });
  }
  
  console.log('Default settings created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
