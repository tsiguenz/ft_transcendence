FROM node:current-alpine3.17

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --only=development

WORKDIR /usr/src/app/transcendence
