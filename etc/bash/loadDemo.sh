#!/bin/sh

#
# Run inside data-pai container with:
#    curl -s https://raw.githubusercontent.com/benc-uk/smilr/master/etc/bash/loadData.sh | sh
#

wget https://raw.githubusercontent.com/benc-uk/smilr/master/etc/demodata.json
curl -d @demodata.json -H "Content-Type: application/json" -X POST http://localhost:4000/api/bulk