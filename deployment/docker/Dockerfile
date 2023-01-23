FROM node:lts-alpine AS builder

WORKDIR /usr/src/explorer-srv

RUN apk add --no-cache git && npm i glob rimraf

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# production
FROM node:lts-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/explorer-srv

ADD https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem ./rds-combined-ca-bundle.pem

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/explorer-srv/dist ./dist

CMD ["node", "dist/main"]
