#
# Build and bundle the Angular app with Angular-CLI
#
FROM node:8-alpine as angularbuild
ARG angular_root="angular"
ARG build_config="production"

WORKDIR /build

# Install all the Angular dev tools & CLI
COPY ${angular_root}/package*.json ./
RUN npm install --silent

# Copy in the Angular source
COPY ${angular_root}/angular.json .
COPY ${angular_root}/tsconfig.json .
COPY ${angular_root}/src ./src

# Run Angular CLI build & bundle, and output to ./dist
RUN node node_modules/@angular/cli/bin/ng build -c ${build_config}

# ===================================================================== #

#
# Build Node.js frontend service, pulling in bundled output from previous step
#
FROM node:8-alpine

LABEL version="2.0.1"
ARG basedir="node/frontend"
ENV NODE_ENV production
WORKDIR /home/app

# NPM install packages
COPY ${basedir}/package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

# Copy in Angular app, uses previous build step 'angularbuild' as source
COPY --from=angularbuild /build/dist .

# Install bash inside container just for debugging 
RUN apk update && apk add bash

EXPOSE 3000
ENTRYPOINT [ "npm" , "start" ]