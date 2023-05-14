#!/bin/sh

set -eu

LIGHT_RED='\033[1;31m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
LIGHT_GREEN='\033[1;32m'
DEFAULT='\033[0m'

ENV_FILE=.env

AUTHORIZE_URL=https://api.intra.42.fr/oauth/authorize
TOKEN_URL=https://api.intra.42.fr/oauth/token

APP42_UID=$(grep APP42_ID ${ENV_FILE} | cut -d '"' -f2)
APP42_SECRET=$(grep APP42_KEY ${ENV_FILE} | cut -d '"' -f2)
APP42_REDIRECT_URI=http://localhost:8080/42/callback

echo APP42_UID=${APP42_UID}
echo APP42_SECRET=${APP42_SECRET}
echo "Redirecting you to the authorization page..."

open "${AUTHORIZE_URL}?client_id=${APP42_UID}&redirect_uri=http://localhost:8080/42/callback&response_type=code"

echo "Enter your authorization code: (you can find it in the URL)"
read AUTHORIZATION_CODE

echo "Requesting access token..."
ACCESS_TOKEN=$(curl -F grant_type=authorization_code \
-F client_id=${APP42_UID} \
-F client_secret=${APP42_SECRET} \
-F code=${AUTHORIZATION_CODE} \
-F redirect_uri=${APP42_REDIRECT_URI} \
-X POST https://api.intra.42.fr/oauth/token \
| cut -d '"' -f4)

echo "ACCESS_TOKEN=${ACCESS_TOKEN}"
echo "Requesting user info..."
RESPONSE=$(curl -H "Authorization: Bearer ${ACCESS_TOKEN}" https://api.intra.42.fr/v2/me | cut -d '"' -f6)
if [ "${RESPONSE}" = "The access token is invalid" ]; then
  echo "Invalid access token!"
else
  echo "Valid access token!"
fi

exit 0
