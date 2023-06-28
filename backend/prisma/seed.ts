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
      hash: await argon.hash('gmetire')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'abourdar' },
    create: {
      nickname: 'abourdar',
      hash: await argon.hash('pioupiou')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'lpassera' },
    create: {
      nickname: 'lpassera',
      hash: await argon.hash('dudududududuel')
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { nickname: 'tsiguenz' },
    create: {
      nickname: 'tsiguenz',
      hash: await argon.hash('password')
    },
    update: {}
  });
}

async function populateChatrooms() {
  await prisma.chatRoom.upsert({
    where: { name: 'general' },
    create: {
      name: 'general'
    },
    update: {}
  });
}

function calculateNewRating(
  winnerRating: number,
  loserRating: number
): { winner: number; loser: number } {
  const D = winnerRating - loserRating;
  const K = 40;
  const pWinner = Math.round((1 / (1 + Math.pow(10, -D / 400))) * 10) / 10;
  const pLoser = Math.round((1 / (1 + Math.pow(10, D / 400))) * 10) / 10;
  const newWinnerRating = Math.round(winnerRating + K * (1 - pWinner));
  const newLoserRating = Math.round(loserRating + K * (0 - pLoser));
  return {
    winner: newWinnerRating,
    loser: newLoserRating
  };
}

async function updateRating(userId: string, newRating: number): Promise<void> {
  await prisma.user
    .update({
      where: { id: userId },
      data: { ladderPoints: newRating }
    })
    .catch((err) => console.log(err));
}

async function populateGames() {
  for (let i = 0; i < 50; i++) {
    const users = await prisma.user.findMany();
    let winner = users[Math.floor(Math.random() * users.length)];
    let loser = users[Math.floor(Math.random() * users.length)];
    while (winner.id === loser.id) {
      winner = users[Math.floor(Math.random() * users.length)];
      loser = users[Math.floor(Math.random() * users.length)];
    }
    const isRanked = Math.random() >= 0.5;
    const randomScore1 = Math.floor(Math.random() * 3) + 1;
    const randomScore2 = Math.floor(Math.random() * 3) + 1;
    const newRating = calculateNewRating(
      winner.ladderPoints,
      loser.ladderPoints
    );
    await prisma.game.upsert({
      where: { id: uuid() },
      create: {
        id: uuid(),
        isRanked: isRanked,
        winnerId: winner.id,
        loserId: loser.id,
        previousWinnerRating: winner.ladderPoints,
        previousLoserRating: loser.ladderPoints,
        newWinnerRating: newRating.winner,
        newLoserRating: newRating.loser,
        winnerScore: randomScore1,
        loserScore: randomScore2
      },
      update: {}
    });
    if (isRanked) {
      await updateRating(winner.id, newRating.winner);
      await updateRating(loser.id, newRating.loser);
    }
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
