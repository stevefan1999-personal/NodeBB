FROM node:lts-bullseye AS builder

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /usr/src/app

COPY install/package.json /usr/src/app/package.json
COPY . .
RUN chmod +x entrypoint.sh

RUN npm install --only=prod && \
    npm cache clean --force

ENV NODE_ENV=production \
    daemon=false \
    silent=false

VOLUME /data
ENTRYPOINT [ "/usr/src/app/entrypoint.sh" ]
CMD [ "./nodebb", "start" ]

EXPOSE 4567
