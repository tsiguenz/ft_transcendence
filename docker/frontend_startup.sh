#!/bin/sh

set -e

npm install

cat > .env << EOF
VITE_APP42_ID=$APP42_ID
VITE_CALLBACK_URL=http://$HOST_IP:8080/42/callback
EOF

exec "$@"
