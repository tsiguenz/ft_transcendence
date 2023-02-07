#!/bin/sh

set -e

npm install --only=development
npx prisma migrate dev --name init
npm run start:dev
rm -rf backend_startup.sh
