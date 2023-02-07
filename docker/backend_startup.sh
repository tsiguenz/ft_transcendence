#!/bin/bash

set -e

if [[ $(uname -a | grep aarch64) ]] && [[ ! -e /lib/libc.musl-aarch64.so.1 ]]; then
	mv /lib/aarch64-linux-musl/libc.so /lib/libc.musl-aarch64.so.1
fi

npm install --only=development
npx prisma migrate dev --name init

exec "$@"
