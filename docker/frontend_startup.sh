#!/bin/sh

set -e

npm install

cat > .env << EOF
VITE_APP42_ID=$APP42_ID
VITE_CALLBACK_URL=http://$HOST_IP:8080/42/callback
EOF

while true
do
    if curl backend:3000 > /dev/null 2>&1;
    then
        echo "Backend is up, starting frontend..."
        break
    fi
    echo "Waiting for backend to start..."
    sleep 10
  done

exec "$@"
