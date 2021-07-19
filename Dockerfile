FROM node:16.5.0-alpine3.11
USER root

WORKDIR /usr/src/app
RUN npm config set user root
RUN apk add --no-cache --virtual .build-deps alpine-sdk bash python
RUN npm install -g probot node-prune --production

COPY package.json package-lock.json ./
RUN npm ci --production && node-prune
RUN apk del .build-deps

COPY lib/ ./

EXPOSE 3000
ENTRYPOINT ["probot", "run", "."]
