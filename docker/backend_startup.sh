#!/bin/bash

set -e

# fix error with lib.musl
if [[ $(uname -a | grep x86_64) ]] && [[ ! -e /lib/libc.musl-x86_64.so.1 ]]; then
  mv /lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1
elif [[ $(uname -a | grep aarch64) ]] && [[ ! -e /lib/libc.musl-aarch64.so.1 ]]; then
  mv /lib/aarch64-linux-musl/libc.so /lib/libc.musl-aarch64.so.1
fi

npm install --only=development
npx prisma migrate deploy
npx prisma generate
# npx prisma migrate dev
# TODO: change this hack to something better
npx prisma db seed

exec "$@"
