#!/bin/sh
trap "kill $MONGO_PID && kill $API_PID" EXIT

sudo mongod -f /etc/mongod.conf &
MONGO_PID=$!
sleep 1
MONGO_CONNSTR=mongodb://localhost MONGO_RETRY_DELAY=2 node node/data-api/server.js &
API_PID=$!
STATIC_DIR=vue/dist API_ENDPOINT=http://localhost:4000 node node/frontend/server.js
