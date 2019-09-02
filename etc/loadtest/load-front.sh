#!/bin/bash

mkdir -p results
chmod a+x bin/hey

# Frontend
bin/hey -z $2s -c 50 -o csv $1> results/frontend.csv
