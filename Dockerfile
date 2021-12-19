FROM node:lts-alpine3.14

RUN apk add --no-cache git fuse-overlayfs
WORKDIR /usr/src/app/base

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY install/package.json package.json

RUN npm install --only=prod && \
    npm cache clean --force
    
COPY . .

ENV NODE_ENV=production \
    daemon=false \
    silent=false

EXPOSE 4567
ENTRYPOINT ["./docker-entrypoint.sh"]
VOLUME ["/mnt/nodebb/user-dir"]