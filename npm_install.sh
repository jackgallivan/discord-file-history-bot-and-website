#!/bin/bash
#
# Installs all node packages for this project.
#
# To execute this script,
# run it from the project root directory:
#   ./npm_install.sh

(
  cd bot/
  npm install
)
(
  cd web/
  npm install
)
(
  cd microservices/image_resizer/
  npm install
)
(
  cd microservices/uuid_generator/
  npm install
)
