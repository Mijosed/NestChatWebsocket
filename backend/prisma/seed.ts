import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding...');

  await prisma.reaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('test1234', 10);

  const [quentin, mijose, anthony] = await Promise.all([
    prisma.user.create({
      data: { email: 'quentin@test.com', username: 'quentin', password, color: '#3b82f6' },
    }),
    prisma.user.create({
      data: { email: 'mijose@test.com', username: 'mijose', password, color: '#ef4444' },
    }),
    prisma.user.create({
      data: { email: 'anthony@test.com', username: 'anthony', password, color: '#22c55e' },
    }),
  ]);

  const general = await prisma.room.create({
    data: {
      name: 'Général',
      members: {
        create: [
          { userId: quentin.id, hasHistory: true },
          { userId: mijose.id, hasHistory: true },
          { userId: anthony.id, hasHistory: true },
        ],
      },
    },
  });

  // Salon privé créé par quentin, mijose invité sans historique
  const room2 = await prisma.room.create({
    data: {
      name: 'dev-team',
      creatorId: quentin.id,
      members: {
        create: [
          { userId: quentin.id, hasHistory: true },
          { userId: mijose.id, hasHistory: false },
        ],
      },
    },
  });

  const msgs = await Promise.all([
    prisma.message.create({
      data: { content: 'Salut tout le monde !', userId: quentin.id, roomId: general.id },
    }),
    prisma.message.create({
      data: { content: 'Hello !', userId: mijose.id, roomId: general.id },
    }),
    prisma.message.create({
      data: { content: 'Ça marche bien ce chat 🎉', userId: anthony.id, roomId: general.id },
    }),
  ]);

  await Promise.all([
    prisma.reaction.create({ data: { emoji: '👍', userId: mijose.id, messageId: msgs[0].id } }),
    prisma.reaction.create({ data: { emoji: '❤️', userId: anthony.id, messageId: msgs[0].id } }),
    prisma.reaction.create({ data: { emoji: '🔥', userId: quentin.id, messageId: msgs[2].id } }),
  ]);

  await prisma.message.create({
    data: { content: 'Canal privé dispo !', userId: quentin.id, roomId: room2.id },
  });

  console.log('✅ Seed terminé');
  console.log('   quentin@test.com / test1234');
  console.log('   mijose@test.com / test1234');
  console.log('   anthony@test.com / test1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
