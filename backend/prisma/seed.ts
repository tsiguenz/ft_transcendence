// https://www.prisma.io/docs/guides/database/seed-database
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function populateUsers() {
  await prisma.user.upsert({
    where: { nickname: 'gmorange' },
    create: {
      nickname: 'gmorange',
      ladderPoints: 2542,
      hash: await argon.hash('gmetire')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'abourdar' },
    create: {
      nickname: 'abourdar',
      ladderPoints: 1914,
      hash: await argon.hash('pioupiou')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'lpassera' },
    create: {
      nickname: 'lpassera',
      ladderPoints: 2292,
      hash: await argon.hash('dudududududuel')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'tsiguenz' },
    create: {
      nickname: 'tsiguenz',
      ladderPoints: 1639,
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

async function populateGames() {
  const users = await prisma.user.findMany();
  for (let i = 0; i < 100; i++) {
    const winner = users[Math.floor(Math.random() * users.length)];
    const loser = users[Math.floor(Math.random() * users.length)];
    const randomBoolean = Math.random() >= 0.5;
    const randomScore1 = Math.floor(Math.random() * 10) + 1;
    const randomScore2 = Math.floor(Math.random() * 10) + 1;
    await prisma.game.upsert({
      where: { id: uuid() },
      create: {
        id: uuid(),
        isRanked: randomBoolean,
        winnerId: winner.id,
        loserId: loser.id,
        previousWinnerRating: winner.ladderPoints,
        previousLoserRating: loser.ladderPoints,
        winnerScore: randomScore1,
        loserScore: randomScore2
      },
      update: {}
    });
  }
}

async function main() {
  await populateUsers();
  await populateChatrooms();
  await populateGames();
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
