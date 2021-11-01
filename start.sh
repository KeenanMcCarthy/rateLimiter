#!/bin/bash

. ${PWD}/config

#start loadBalancer
PORT=$LBPORT DESTIP=$DESTIP DESTPORT=$DESTPORT QSIZE=$QUORUMSIZE LIMIT=$MAXREQ node loadBalancer.js &> logs.txt &

#loop through and start servers
for i in "${SERVERPORTS[@]}"
do
  PGPASSWORD=$PGPSSWRD psql -U $PGUNAME -c "CREATE DATABASE rlproject${i};"
  PGPASSWORD=$PGPSSWRD psql -U $PGUNAME -d rlproject${i} -v v1="'5 minutes'" -f rateLimitingDB.sql
  PORT=$i LB=$LBPORT TINT=$TIMEINT MAXREQ=$MAXREQ node server.js &> logs.txt &
done
