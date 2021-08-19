FROM node:lts-bullseye AS builder

WORKDIR /usr/src/app

COPY install/package.json /usr/src/app/package.json

RUN yarn --prod --unsafe-perm && \
    yarn cache clean --force

FROM node:lts-bullseye-slim

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY --from=builder /usr/src/app/node_modules/ node_modules/
COPY install/package.json package.json
COPY . .
RUN chmod +x entrypoint.sh

ENV NODE_ENV=production \
    daemon=false \
    silent=false

VOLUME /data
ENTRYPOINT [ "/usr/src/app/entrypoint.sh" ]
CMD [ "nodebb", "start" ]

EXPOSE 4567
