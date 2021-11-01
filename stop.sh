#!/bin/bash

. ${PWD}/config

kill $(lsof -t -i ":${LBPORT}")

for i in "${SERVERPORTS[@]}"
do
  PGPASSWORD=$PGPSSWRD psql -U $PGUNAME -c "DROP DATABASE rlproject${i};"
  kill $(lsof -t -i ":${i}")
done
