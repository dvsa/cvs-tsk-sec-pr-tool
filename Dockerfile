FROM node:12-alpine
USER root

WORKDIR /usr/src/app
RUN npm config set user root
RUN apk add --no-cache --virtual .build-deps alpine-sdk python
RUN npm install -g probot node-prune --production

COPY package.json package-lock.json ./
RUN npm ci --production && node-prune
RUN apk del .build-deps

COPY lib/ ./

EXPOSE 3000
ENTRYPOINT ["probot", "run", "."]
