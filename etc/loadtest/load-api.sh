#!/bin/bash
set -x

mkdir -p results

# Create 10 events
hey -n 10 -c 1 -m POST -H "Content-Type: application/json" -D event.json $1/api/events > /dev/null

# API read
hey -z $2s -c 50 -o csv $1/api/events > results/api-read.csv

# API write
hey -z $2s -c 10 -m POST -H "Content-Type: application/json" -D event.json -o csv $1/api/events > results/api-write-10.csv
hey -z $2s -c 50 -m POST -H "Content-Type: application/json" -D event.json -o csv $1/api/events > results/api-write-50.csv
hey -z $2s -c 100 -m POST -H "Content-Type: application/json" -D event.json -o csv $1/api/events > results/api-write-100.csv
