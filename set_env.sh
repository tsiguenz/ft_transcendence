#!/bin/sh

set -eu

LIGHT_RED='\033[1;31m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
LIGHT_GREEN='\033[1;32m'
DEFAULT='\033[0m'

ENV_FILE=.env

function print_pong_ascii_art() {
  echo_colored "${LIGHT_GREEN}" "\nYou are ready to play pong like a pro!\n"
  echo_colored "${LIGHT_GREEN}" "          O ."
  echo_colored "${LIGHT_GREEN}" "        _/|\_-O"
  echo_colored "${LIGHT_GREEN}" "       ___|_______"
  echo_colored "${LIGHT_GREEN}" "      /     |     \\ "
  echo_colored "${LIGHT_GREEN}" "     /      |      \\ "
  echo_colored "${LIGHT_GREEN}" "    #################"
  echo_colored "${LIGHT_GREEN}" "   /   _ ( )|        \\ "
  echo_colored "${LIGHT_GREEN}" "  /   ( ) | |         \\ "
  echo_colored "${LIGHT_GREEN}" " /  \  |_/  |          \\ "
  echo_colored "${LIGHT_GREEN}" "/____\/|____|___________\\ "
  echo_colored "${LIGHT_GREEN}" "   |   |             |"
  echo_colored "${LIGHT_GREEN}" "   |  / \            |"
  echo_colored "${LIGHT_GREEN}" "   | /   \           |"
  echo_colored "${LIGHT_GREEN}" "   _/    /_\n"
}

function echo_colored() {
  echo "${1}${2}${DEFAULT}"
}

trap "{ echo_colored '${LIGHT_RED}' 'Terminated by SIGINT'; exit 1; }" SIGINT

function create_env_file() {
  if [ ! -f .env ]; then
    echo_colored "${CYAN}" "File ${ENV_FILE} does not exist. Creating it..."
  else
    echo_colored "${CYAN}" "File ${ENV_FILE} exists, do you want to overwrite it? (y/n)"
    read -r OVERWRITE
    if [ "$OVERWRITE" = "y" ]; then
      echo_colored "${CYAN}" "Overwriting ${ENV_FILE}...\n"
      rm -f ${ENV_FILE}
    else
      echo_colored "${CYAN}" "Not overwriting ${ENV_FILE}"
      exit 0
    fi
  fi
  touch ${ENV_FILE}
}

function set_env_var() {
  echo "$1=\"$2\"" >> ${ENV_FILE}
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
  local VALUE=$(openssl rand -base64 32)
  # delete all slashes and backslashes to avoid escaping issues
  VALUE=$(echo "$VALUE" | tr -d '\\/')
  set_env_var "$1" "$VALUE"
}

function set_app42_env_vars() {
  local APP_KEYS_DIR=~/.42keys
  local APP_UID_FILE_NAME=transcendence_uid.txt
  local APP_SECRET_FILE_NAME=transcendence_secret.txt
  if [ ! -f ${APP_KEYS_DIR}/${APP_UID_FILE_NAME} ] || [ ! -f ${APP_KEYS_DIR}/${APP_SECRET_FILE_NAME} ]; then
    echo_colored "${CYAN}" "Directory ~/.42keys does not exist. Creating it..."
    mkdir -p ${APP_KEYS_DIR}
    touch ${APP_KEYS_DIR}/${APP_UID_FILE_NAME}
    touch ${APP_KEYS_DIR}/${APP_SECRET_FILE_NAME}
    echo_colored "${CYAN}" "Please enter your App42 credentials:"
    echo_colored "${CYAN}" "App42 UID:"
    read -r APP42_ID
    echo "$APP42_ID" > ${APP_KEYS_DIR}/${APP_UID_FILE_NAME}
    echo_colored "${CYAN}" "App42 SECRET:"
    read -r APP42_KEY
    echo "$APP42_KEY" > ${APP_KEYS_DIR}/${APP_SECRET_FILE_NAME}
  fi
  echo_colored "${CYAN}" "Setting App42 environment variables from ~/.keys42..."
  local APP_ID=$(cat ${APP_KEYS_DIR}/$APP_UID_FILE_NAME)
  local APP_KEY=$(cat ${APP_KEYS_DIR}/$APP_SECRET_FILE_NAME)
  set_env_var "APP42_ID" "${APP_ID}"
  set_env_var "APP42_KEY" "${APP_KEY}"
}

function set_env() {
  create_env_file
  set_hostname
  ask_to_set_env_var "POSTGRES_USER"
  ask_to_set_env_var "POSTGRES_DB"
  ask_to_set_env_var "DB_NAME"
  ask_to_set_env_var "DB_USER"
  ask_to_set_env_var "TEST_DB_NAME"
  ask_to_set_env_var "APP_NAME"
  set_app42_env_vars
  generate_random_env_var "POSTGRES_PASSWORD"
  generate_random_env_var "DB_PASSWORD"
  generate_random_env_var "JWT_ACCESS_SECRET"
  generate_random_env_var "JWT_REFRESH_SECRET"
  print_pong_ascii_art
}

set_env
