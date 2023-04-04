#!/bin/sh

set -e

npm install
echo "VITE_APP42_ID=$APP42_ID" > .env

exec "$@"
