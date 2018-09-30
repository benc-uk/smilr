#
# Build Angular app using @angular/cli
#
FROM stefanscherer/node-windows:8-nanoserver as angularbuild
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
# Note on Windows the use of % to use a build-arg in a RUN 
RUN node node_modules/@angular/cli/bin/ng build -c %build_config%

# ===================================================================== #

#
# Build Node.js frontend service, pulling in bundled output from previous step
#
FROM stefanscherer/node-windows:8-nanoserver
LABEL version="2.0.1" 
ARG basedir="node/frontend"

# Node.js setup for the frontend
ENV NODE_ENV production
WORKDIR /home/app

# For efficient layer caching with NPM, this *really* speeds things up
COPY ${basedir}/package*.json ./

# NPM install for the server packages
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

# Copy in Angular app, uses previous image in Dockerfile
COPY --from=angularbuild /build/dist .

EXPOSE 3000
ENTRYPOINT [ "npm" , "start" ]