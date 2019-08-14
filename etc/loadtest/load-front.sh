#!/bin/bash

mkdir -p results

# Frontend
bin/hey -z $2s -c 50 $1 > results/frontend.txt
