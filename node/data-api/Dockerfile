FROM node:8-alpine
LABEL version="2.0.0" 
ARG basedir="node/data-api"

# Node.js setup for the data-api
ENV NODE_ENV production
WORKDIR /home/app

# For efficient layer caching with NPM, this *really* speeds things up
COPY ${basedir}/package.json .

# NPM install for the server packages
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

# Install bash inside container as it's good for debugging 
RUN apk update && apk add bash

EXPOSE 4000
CMD npm start