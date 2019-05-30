#!/bin/bash
i=0
until curl -s $1 > /dev/null; do                                                                                                             
  echo Retrying URL $1
  sleep 1
  i=$((i+1))                                                                                                                                 
  if [ "$i" -eq $2 ] ; then
    exit
  fi
done
