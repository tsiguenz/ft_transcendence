// https://www.prisma.io/docs/guides/database/seed-database
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

// TODO: setup an account with 2fa enabled for testing
async function populateUsers() {
  await prisma.user.upsert({
    where: { nickname: 'gmorange' },
    create: {
      nickname: 'gmorange',
      ladderPoints: 682,
      hash: await argon.hash('gmetire')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'abourdar' },
    create: {
      nickname: 'abourdar',
      ladderPoints: 836,
      hash: await argon.hash('pioupiou')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'lpassera' },
    create: {
      nickname: 'lpassera',
      ladderPoints: 712,
      hash: await argon.hash('dudududududuel')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'tsiguenz' },
    create: {
      nickname: 'tsiguenz',
      // oopsi miss click
      ladderPoints: 999999999,
      hash: await argon.hash('password')
    },
    update: {}
  });
}

async function populateChatrooms() {
  await prisma.chatRoom.upsert({
    where: { name: 'general' },
    create: {
      name: 'general',
      slug: 'chatroom_general'
    },
    update: {}
  });
}

async function main() {
  await populateUsers();
  await populateChatrooms();
  // await populateMessages();
  // await populateGames();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
