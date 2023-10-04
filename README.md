# Knowledge base

## Setup production project:
- clone the repo
- add .env-prod file to app/ and front/
- docker compose -f docker-compose-prod.yml up -d

## Setup local dev:
- clone the repo
- add .env file to app/ and front/
- docker compose -f docker-compose.yml up -d

front .env/.env-prod file example:
- VITE_API_URL=localhost
- VITE_API_PORT=8080
- VITE_API_PROTOCOL=http

app .env/.env-prod file example:
- APP_PORT=8080
- FRONTEND_HOST=localhost
- FRONTEND_PORT=80
- FRONTEND_PROTOCOL=http