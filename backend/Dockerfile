FROM node:latest

RUN apt-get update
RUN apt-get install -y postgresql-client

WORKDIR /usr/src/app

CMD ["npm", "run", "start"]
