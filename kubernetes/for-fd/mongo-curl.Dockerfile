FROM mongo:3.4-jessie

WORKDIR /home/demo

RUN apt update
RUN apt install curl -y


