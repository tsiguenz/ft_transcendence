// https://www.prisma.io/docs/guides/database/seed-database
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function populateUsers() {
  await prisma.user.upsert({
    where: { id: '1' },
    create: {
      id: '1',
      nickname: 'gmorange',
      ladderPoints: 682,
      hash: await argon.hash('gmetire')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { id: '2' },
    create: {
      id: '2',
      nickname: 'abourdar',
      ladderPoints: 836,
      hash: await argon.hash('pioupiou')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { id: '3' },
    create: {
      id: '3',
      nickname: 'lpassera',
      ladderPoints: 712,
      hash: await argon.hash('dudududududuel')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { id: '4' },
    create: {
      id: '4',
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

async function populateGames() {
  const users = await prisma.user.findMany();
  for (let i = 0; i < 100; i++) {
    const winner = users[Math.floor(Math.random() * users.length)];
    const loser = users[Math.floor(Math.random() * users.length)];
    const randomBoolean = Math.random() >= 0.5;
    const randomScore1 = Math.floor(Math.random() * 10) + 1;
    const randomScore2 = Math.floor(Math.random() * 10) + 1;
    await prisma.game.upsert({
      where: { id: i.toString() },
      create: {
        id: i.toString(),
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
  // await populateMessages();
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
