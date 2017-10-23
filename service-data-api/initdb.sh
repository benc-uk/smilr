#!/bin/bash


echo "Deleting table..."
r=`curl -o /dev/null --silent --write-out '%{http_code}\n' http://$1/api/db/delete`
echo "Deleting resp was: $r"
echo

r=`curl -o /dev/null --silent --write-out '%{http_code}\n' http://$1/api/db/create`
echo "Create table resp: $r"
while [ $r -ne 200 ]; do
   echo "Table still being deleted, trying again in 10 seconds."
   sleep 10
   r=`curl -o /dev/null --silent --write-out '%{http_code}\n' http://$1/api/db/create`
   echo "Create table resp: $r"
done

echo
echo "Populating with seed data..."
r=`curl -o /dev/null --silent --write-out '%{http_code}\n' http://$1/api/db/seed`
echo "Seed table resp: $r"