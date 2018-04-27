FROM node:8-alpine

WORKDIR /home/app

COPY node/data-api/ .
RUN npm install --production --silent

EXPOSE 4000

CMD node /home/app/server.js