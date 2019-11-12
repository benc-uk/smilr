FROM node:12-alpine
LABEL Name="nodejs-api-starter" Version=0.0.1
ENV NODE_ENV production
WORKDIR /app 

# For Docker layer caching do this BEFORE copying in rest of app
COPY package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the rest of the project to the workdir
COPY . .

EXPOSE 3000
ENTRYPOINT ["npm", "start"]