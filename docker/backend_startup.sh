#!/bin/sh

set -e
if (uname -a | grep x86_64); then
	if [[ -f /lib/libc.musl-x86_64.so.1 ]]; then
		mv /lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1
	fi
else
	if [[ -f /lib/libc.musl-aarch64.so.1 ]]; then
		mv /lib/aarch64-linux-musl/libc.so /lib/libc.musl-aarch64.so.1
	fi
fi

npm install --only=development
npx prisma migrate dev
npm run start:dev
rm -rf backend_startup.sh
