# https://blog.codeship.com/using-docker-compose-for-nodejs-development/
FROM node:10-alpine

WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY . .

#EXPOSE 3000