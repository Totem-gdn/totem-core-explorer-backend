# Totem Core Explorer Backend

Totem Core Explorer backend service responsible for working with smart contracts deployed on the Polygon network and
storing data from contracts for faster and more flexible access.

## Development

1. Install dependencies:
    ```bash
    npm install
    ```
2. Create [MongoDB](https://www.mongodb.com/compatibility/docker)
   and [Redis](https://redis.io/docs/stack/get-started/install/docker/) in Docker, or use local variants.
3. Create `.env` file from example `.env.sample` and fill in environment variables:
   ```dotenv
    GRPC_URL=0.0.0.0:50051
    REDIS_URL=redis://127.0.0.1:6379/0
    MONGODB_URI=mongodb://user:pass@127.0.0.1:27017
    MONGODB_DATABASE=explorer-storage
    PROVIDER_URL=https://polygon-mumbai.chainstacklabs.com
    PROVIDER_PRIVATE_KEY=
    AVATAR_LEGACY_CONTRACT=
    ITEM_LEGACY_CONTRACT=
    GEM_LEGACY_CONTRACT=
    GAME_LEGACY_CONTRACT=
    GAMES_DIRECTORY_CONTRACT=
   ```
   `PROVIDER_PRIVATE_KEY` must be the account that deployed the smart contracts.    
   `*_CONTRACT` variables are the addresses of deployed smart contracts.    
   Smart contracts can be found in the [Totem Smart Contracts](https://github.com/Totem-gdn/totem-smart-contracts)
   repository.
4. Run service in development mode:
   ```bash
   npm run start:dev
   ```
   Debug mode:
   ```bash
   npm run start:debug
   ```
   If Node.js default debug port `9229` is busy -- you can change it like this:
   ```bash
   npm run start:debug -- --debug 0.0.0.0:9228
   ```

## Build without Docker

1. Build service with version ([git](https://git-scm.com/) required):
   ```bash
   npm run build
   ```
   Build service without version (without git):
   ```bash
   npm run build:app
   ```
2. Run service:
   ```bash
   node dist/main
   ```

## Build with Docker

1. Build docker image:
   ```bash
   docker build -f deployment/docker/Dockerfile -t totem-core-explorer-backend:latest .
   ```
