#!/bin/bash

if [ ! -f .env ]; then
    echo ".env file not found"
    exit
fi

export $(grep -v '^#' .env | xargs -0)

dotnet run
