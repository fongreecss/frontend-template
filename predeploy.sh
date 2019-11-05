#!/bin/bash

# Link .env and uploads
ln -nfs /storage/.env .env
ln -nfs /storage/uploads web/app/uploads

# npm install dependencies
npm i

# Build frontend
npm run production

# postdeploy, clear cache (cloudflare, w3)
