// https://www.prisma.io/docs/guides/database/seed-database
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

// TODO: setup an account with 2fa enabled for testing
async function populateUsers() {
  await prisma.user.create({
    data: {
      nickname: 'gmorange',
      ladderPoints: 682,
      hash: await argon.hash('gmetire')
    }
  });
  await prisma.user.create({
    data: {
      nickname: 'abourdar',
      ladderPoints: 836,
      hash: await argon.hash('pioupiou')
    }
  });
  await prisma.user.create({
    data: {
      nickname: 'lpassera',
      ladderPoints: 712,
      hash: await argon.hash('dudududududuel')
    }
  });
  await prisma.user.create({
    data: {
      nickname: 'tsiguenz',
      // oopsi miss click
      ladderPoints: 999999999,
      hash: await argon.hash('password')
    }
  });
}

async function populateChatrooms() {
  await prisma.chatRoom.create({
    data: {
      name: 'general',
      slug: 'chatroom_general',
    }
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
