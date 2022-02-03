FROM node:lts-alpine3.14

RUN apk add --no-cache git build-base python3 py3-pip bash

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV \
    daemon=false \
    silent=false

USER node
RUN mkdir -p /usr/src/app && \
    chown -R node:node /usr/src/app
WORKDIR /usr/src/app

COPY --chown=node:node . /usr/src/app

EXPOSE 4567
VOLUME ["/usr/src/app/node_modules", "/usr/src/app/build", "/usr/src/app/public/uploads", "/opt/config"]
ENTRYPOINT ["./docker-entrypoint.sh"]