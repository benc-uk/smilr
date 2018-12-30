#
# Build and bundle the Vue.js app with Vue CLI 3 https://cli.vuejs.org/
#
# Base Windows Nanoserver image with Node 8.x
# Using Stefan Scherer's semi offical Node for Windows images https://hub.docker.com/r/stefanscherer/node-windows
FROM stefanscherer/node-windows:10.14.0-nanoserver-2016 as spabuild
ARG vue_root="vue"
ARG build_info="Docker container build"

WORKDIR /build

# Install all the Vue.js dev tools & CLI, and our app dependencies 
COPY ${angular_root}/package*.json ./
RUN npm install --silent

# Copy in the Vue.js app source
COPY ${vue_root}/.env.production .
COPY ${vue_root}/public ./public
COPY ${vue_root}/src ./src

ENV VUE_APP_BUILD_INFO $build_info

# Run Vue CLI build & bundle, and output to ./dist
# Updated to run in modern mode https://cli.vuejs.org/guide/browser-compatibility.html#modern-mode
RUN npm run build-modern

# ===================================================================== #

#
# Build Node.js frontend service, pulling in bundled output from previous step
#
# Base Windows Nanoserver image with Node 8.x
# Using Stefan Scherer's semi offical Node for Windows images https://hub.docker.com/r/stefanscherer/node-windows
FROM stefanscherer/node-windows:10.14.0-nanoserver-2016

LABEL version="2.2.0" 
ARG basedir="node/frontend"
ENV NODE_ENV production

# Place our app here
WORKDIR /home/app

# NPM install packages
COPY ${basedir}/package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

# Copy in Vue.js app, uses previous build step 'spabuild' as source
COPY --from=spabuild /build/dist .

EXPOSE 3000
ENTRYPOINT [ "node" , "server.js" ]