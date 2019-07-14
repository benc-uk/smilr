# Base Windows Nanoserver image with Node
# Using Stefan Scherer's semi offical Node for Windows images https://hub.docker.com/r/stefanscherer/node-windows

FROM stefanscherer/node-windows:10.16.0-nanoserver-1809

# Build time arguments
LABEL version="4.1.0" 
ARG basedir="node/data-api"
ARG build_info="Windows Nanoserver 1809 container build"
ENV NODE_ENV production
ENV BUILD_INFO $build_info

# Place our app here
WORKDIR /home/app

# NPM install packages
COPY ${basedir}/package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

EXPOSE 4000
ENTRYPOINT [ "node" , "server.js" ]