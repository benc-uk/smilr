FROM node:8-alpine

LABEL org.label-schema.name="Smilr Bot" \
      org.label-schema.description="Bot Framework demo bot for Smilr" \    
      org.label-schema.version="1.0.0" \
      org.label-schema.vcs-url="https://github.com/benc-uk/microservices-demoapp" \  
      org.label-schema.url="http://aka.ms/smilr-project" \
      org.label-schema.docker.schema-version="1.0"

ARG basedir="bot"
ENV NODE_ENV production
ENV PORT=3978
ENV MicrosoftAppId=<<CHANGEME-APP-GUID>>
ENV MicrosoftAppPassword=<<CHANGEME-APP-PASSWORD>>
ENV LuisAppId=<<CHANGEME-APP-GUID>>
ENV LuisAPIKey=<<CHANGEME-APP-KEY>>
ENV LuisAPIHostName=<<CHANGEME-REGION>>.api.cognitive.microsoft.com
ENV API_ENDPOINT=http://changeme.net/api

WORKDIR /home/bot

# NPM install packages
COPY ${basedir}/package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

# Install bash inside container just for debugging 
RUN apk update && apk add bash

EXPOSE 3978
CMD npm start