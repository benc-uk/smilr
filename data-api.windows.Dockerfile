FROM stefanscherer/node-windows:8.9.4-nanoserver-2016
ARG basedir="service-data-api"

# Node.js setup for the data-api
ENV NODE_ENV production
WORKDIR /home/app

# For efficient layer caching with NPM, this *really* speeds things up
COPY ${basedir}/package.json .

# NPM install for the server packages
RUN npm install --production

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

EXPOSE 4000
CMD npm start