#!/bin/bash
#
# Runs all the node.js servers, including:
# bot server, web server, and two microservices.
#
# To execute this script, change permissions first,
# then run it from the project root directory:
#   chmod +x ./run_all.sh
#   ./run_all.sh

(
  trap 'kill 0' SIGINT
  (
    cd bot/
    npm start
  ) &
  (
    cd web/
    npm start
  ) &
  (
    cd microservices/image_resizer/
    npm start
  ) &
  (
    cd microservices/uuid_generator/
    npm start
  ) &
  wait
)
