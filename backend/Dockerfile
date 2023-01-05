FROM node:latest

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --only=development

WORKDIR /usr/src/app/transcendence
