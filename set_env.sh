#!/bin/sh

# exit on error and unset variables
set -eu

LIGHT_RED='\033[1;31m'
CYAN='\033[0;36m'
DEFAULT='\033[0m'
ENV_FILE=.env

function echo_colored() {
  echo "${1}${2}${DEFAULT}"
}

# catch SIGINT and exit with error
trap "{ echo_colored '${LIGHT_RED}' 'Terminated by SIGINT'; exit 1; }" SIGINT

function create_env_file() {
  if [ ! -f .env ]; then
    echo_colored "${CYAN}" "File ${ENV_FILE} does not exist. Creating it..."
  else
    echo_colored "${CYAN}" "File ${ENV_FILE} exists, do you want to overwrite it? (y/n)"
    read -r OVERWRITE
    if [ "$OVERWRITE" = "y" ]; then
      echo_colored "${CYAN}" "Overwriting ${ENV_FILE}..."
      rm -f ${ENV_FILE}
    else
      echo_colored "${CYAN}" "Not overwriting ${ENV_FILE}..."
      exit 0
    fi
  fi
  touch ${ENV_FILE}
}

function set_env_var() {
  echo "\"$1=$2\"" >> ${ENV_FILE}
}

function set_hostname() {
  local HOST_IP_VAR="HOST_IP"
  echo_colored "${CYAN}" "Setting ${HOST_IP_VAR}..."
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    set_env_var "${HOST_IP_VAR}" "$(hostname -I | awk '{print $1}')"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    set_env_var "${HOST_IP_VAR}" "$(ipconfig getifaddr en0)"
  else
    echo_colored "${CYAN}" "Unsupported OS, please set HOST_IP manually"
    ask_to_set_env_var "${HOST_IP_VAR}"
  fi
}

function ask_to_set_env_var() {
  echo_colored "${CYAN}" "Enter value for $1:"
  read -r VALUE
  set_env_var "$1" "$VALUE"
}

function generate_random_env_var() {
  echo_colored "${CYAN}" "Generating random value for $1..."
  VALUE=$(openssl rand -base64 32)
  set_env_var "$1" "$VALUE"
}

create_env_file
set_hostname
ask_to_set_env_var "POSTGRES_USER"
generate_random_env_var "POSTGRES_PASSWORD"
ask_to_set_env_var "POSTGRES_DB"
ask_to_set_env_var "DB_NAME"
ask_to_set_env_var "DB_USER"
generate_random_env_var "DB_PASSWORD"
ask_to_set_env_var "TEST_DB_NAME"
generate_random_env_var "JWT_ACCESS_SECRET"
generate_random_env_var "JWT_REFRESH_SECRET"
ask_to_set_env_var "APP42_ID"
ask_to_set_env_var "APP42_KEY"
ask_to_set_env_var "APP_NAME"
