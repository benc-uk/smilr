FROM node:6-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY . .
RUN npm install --production --silent
EXPOSE 3000
CMD npm start