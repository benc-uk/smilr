#!/bin/bash

mkdir -p results

# Create 10 events
hey -n 10 -c 1 -m POST -H "Content-Type: application/json" -D event.json $1/api/events > /dev/null

# API read
bin/hey -z $2s -c 50 $1/api/events > results/api-read.txt

# API write
bin/hey -z $2s -c 10 -m POST -H "Content-Type: application/json" -D event.json $1/api/events > results/api-write-10.txt
bin/hey -z $2s -c 50 -m POST -H "Content-Type: application/json" -D event.json $1/api/events > results/api-write-50.txt
bin/hey -z $2s -c 100 -m POST -H "Content-Type: application/json" -D event.json $1/api/events > results/api-write-100.txt
