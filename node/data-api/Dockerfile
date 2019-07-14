# Base Alpine linux image with Node 10.x
FROM node:10-alpine

# Build time arguments
LABEL version="4.3.0" 
ARG basedir="node/data-api"
ARG build_info="Docker container build"
ENV NODE_ENV production
ENV BUILD_INFO $build_info

# Place our app here
WORKDIR /home/app

# Install bash inside container just for debugging 
RUN apk update && apk add bash

# NPM install packages
COPY ${basedir}/package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

EXPOSE 4000
ENTRYPOINT [ "npm" , "start" ]