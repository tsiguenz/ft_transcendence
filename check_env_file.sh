#!/bin/zsh

set -e

LIGHT_RED='\033[1;31m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
LIGHT_GREEN='\033[1;32m'
DEFAULT='\033[0m'

ENV_FILE=.env

function echo_colored() {
  echo "${1}${2}${DEFAULT}"
}

function check_42_creds() {
  local AUTHORIZE_URL=https://api.intra.42.fr/oauth/authorize
  local TOKEN_URL=https://api.intra.42.fr/oauth/token

  local APP42_UID=$(grep APP42_ID ${ENV_FILE} | cut -d '"' -f2)
  local APP42_SECRET=$(grep APP42_KEY ${ENV_FILE} | cut -d '"' -f2)
  local APP42_REDIRECT_URI=http://localhost:8080/42/callback

  echo_colored ${CYAN} "Getting credentials..."
  echo_colored ${CYAN} "Redirecting to 42's authorization page..."
  open "${AUTHORIZE_URL}?client_id=${APP42_UID}&redirect_uri=http://localhost:8080/42/callback&response_type=code" > /dev/null 2>&1
  echo_colored ${CYAN} "Please enter the authorization code:"
  read AUTHORIZATION_CODE
  echo_colored ${CYAN} "Getting access token..."
  local ACCESS_TOKEN=$(curl -F grant_type=authorization_code \
    -F client_id=${APP42_UID} \
    -F client_secret=${APP42_SECRET} \
    -F code=${AUTHORIZATION_CODE} \
    -F redirect_uri=${APP42_REDIRECT_URI} \
    -X POST https://api.intra.42.fr/oauth/token \
    2> /dev/null \
    | cut -d '"' -f4)
  echo_colored ${CYAN} "Testing access token..."
  local RESPONSE=$(curl -H "Authorization: Bearer ${ACCESS_TOKEN}" \
                    https://api.intra.42.fr/v2/me 2>/dev/null | cut -d '"' -f6)
  if [ "${RESPONSE}" = "The access token is invalid" ]; then
    echo_colored ${LIGHT_RED} "Credentials are invalid. Please check your ${ENV_FILE} file."
    echo_colored ${LIGHT_RED} "APP42_ID=${APP42_UID}"
    echo_colored ${LIGHT_RED} "APP42_KEY=${APP42_SECRET}"
    exit 1
  else
    echo_colored ${LIGHT_GREEN} "Access token is valid!"
  fi
}

function check_env_file() {
  if [ ! -f ${ENV_FILE} ]; then
    echo_colored ${LIGHT_RED} "File ${ENV_FILE} not found."
    exit 1
  fi
}

function get_env_var() {
  local ENV_VAR_NAME=${1}
  local ENV_VAR_VALUE=$(grep ${ENV_VAR_NAME} ${ENV_FILE} | cut -d '"' -f2)
  echo ${ENV_VAR_VALUE}
}

function check_env_variable_is_defined() {
  local ENV_VAR_VALUE=$(get_env_var ${1})
  if [ -z "${ENV_VAR_VALUE}" ]; then
    echo_colored ${LIGHT_RED} "Variable ${1} is not defined in ${ENV_FILE}."
    exit 1
  fi
}

function check_bad_chars() {
  local ENV_VAR_VALUE=$(get_env_var ${1})
  local RET=$(echo ${ENV_VAR_VALUE} | grep -E "[\\\/\'\`]")
  if [ -n "${RET}" ]; then
    echo_colored ${LIGHT_RED} "Variable ${1} contains bad characters. (\\, /, ', \`)"
    exit 1
  fi
}

function check_env_variables() {
  echo_colored ${CYAN} "Checking environment variables..."
  check_env_variable_is_defined POSTGRES_USER
  check_env_variable_is_defined POSTGRES_DB
  check_env_variable_is_defined DB_NAME
  check_env_variable_is_defined DB_USER
  check_env_variable_is_defined TEST_DB_NAME
  check_env_variable_is_defined APP_NAME
  check_env_variable_is_defined APP42_ID
  check_env_variable_is_defined APP42_KEY
  check_env_variable_is_defined POSTGRES_PASSWORD
  check_env_variable_is_defined DB_PASSWORD
  check_env_variable_is_defined JWT_ACCESS_SECRET
  check_env_variable_is_defined JWT_REFRESH_SECRET
  check_env_variable_is_defined HOST_IP
  check_bad_chars POSTGRES_PASSWORD
  check_bad_chars DB_PASSWORD
  check_bad_chars JWT_ACCESS_SECRET
  check_bad_chars JWT_REFRESH_SECRET
  echo_colored ${LIGHT_GREEN} "Environment variables looks good!"
}

if [ "${1}" = "--help" ]; then
  echo_colored ${CYAN} "Usage: ./setup.sh [--42]"
  echo_colored ${CYAN} "  --42: Check 42 credentials."
  exit 0
fi

check_env_file
check_env_variables

if [ "${1}" = "--42" ]; then
  check_42_creds
fi


exit 0
