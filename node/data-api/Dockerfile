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

# Copy in demoData script in case we need it, all of this is a nice to have
COPY scripts/demoData/demoData.js ./demoData/
COPY scripts/demoData/source-data.json ./demoData/
RUN sed -i 's/..\/node\/data-api\///g' -i ./demoData/demoData.js

# Install bash inside container as it's good for debugging 
RUN apk update && apk add bash

EXPOSE 4000
CMD npm start