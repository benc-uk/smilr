#!/bin/bash
set -x
mkdir -p results

# Frontend
hey -z $2s -c 50 -o csv $1> results/frontend.csv
