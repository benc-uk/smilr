# Base Alpine linux image with Node 8.x
FROM stefanscherer/node-windows:8-nanoserver

LABEL version="3.1.0" 
ARG basedir="node/data-api"
ARG build_info="Docker Windows container build"
ENV NODE_ENV production
ENV NODE_ENV production
WORKDIR /home/app

# NPM install packages
COPY ${basedir}/package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

EXPOSE 4000
ENTRYPOINT [ "npm" , "start" ]