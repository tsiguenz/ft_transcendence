#!/bin/sh

set -e
npm install --only=development
npx prisma migrate dev
npm run start:dev
rm -rf backend_startup.sh