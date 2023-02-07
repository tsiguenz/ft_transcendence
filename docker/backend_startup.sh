#!/bin/sh

set -e

if [[ ( uname -a | grep arm64 ) && -f /lib/libc.musl-aarch64.so.1 ]]; then
	mv /lib/aarch64-linux-musl/libc.so /lib/libc.musl-aarch64.so.1
fi

npm install --only=development
npx prisma migrate dev --name init

exec "$@"
