#!/bin/sh

set -e
npm install --only=development
npx prisma migrate dev
npm run start:dev

exec "$@"
# rm -rf backend_startup.sh
