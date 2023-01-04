#!/bin/bash

set -e

# init user and db
psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER --dbname $POSTGRES_DB <<-EOSQL
	CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
	CREATE DATABASE $DB_NAME;
	GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER --dbname $DB_NAME <<-EOSQL
	GRANT ALL ON SCHEMA public TO $DB_USER;
	DROP DATABASE root;
EOSQL

# create tables
psql -v ON_ERROR_STOP=1 --username $DB_USER --dbname $DB_NAME <<-EOSQL
	CREATE TABLE users (
	    name            varchar(80)
	);
EOSQL
