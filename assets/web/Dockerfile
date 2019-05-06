# -------------------------------------------------------------------------------------------------
FROM golang:1.10 as hostmgr-builder

RUN git clone https://github.com/kramergroup/hostmgr.git /go/src/github.com/kramergroup/hostmgr
WORKDIR /go/src/github.com/kramergroup/hostmgr
RUN CGO_ENABLED=1 go build -o hostmgr cmd/hostmgr/main.go

# -------------------------------------------------------------------------------------------------
FROM node:10.14.0-stretch as app-builder

RUN apt-get update && \
    apt-get install -y make python build-essential && \
     rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY src /app/src
COPY *.json *.js *.lock /app/

RUN yarn install
RUN yarn build:server
RUN yarn build:client

# -------------------------------------------------------------------------------------------------
# This is a sample site-builder stage that can be used to copy the content
# -------------------------------------------------------------------------------------------------
# FROM klakegg/hugo:latest as site-builder

# WORKDIR /src

# COPY site /src
# RUN hugo

# -------------------------------------------------------------------------------------------------
FROM node:10.14.0-stretch
MAINTAINER d.kramer@soton.ac.uk

RUN apt-get update -y && \
    apt-get install -y python bash git nano vim supervisor && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 3000

WORKDIR /app

# Configure ssh environment
COPY --from=hostmgr-builder /go/src/github.com/kramergroup/hostmgr/hostmgr /usr/sbin/hostmgr
COPY assets/web/ssh_config /etc/ssh/ssh_config

# Application
COPY --from=app-builder /app/package.json /app 
COPY --from=app-builder /app/*.lock /app 
COPY --from=app-builder /app/dist/bin/*.js /app/bin/
RUN yarn install && rm package.json *.lock
COPY server.config.json /app

# Static site
ONBUILD COPY --from=site-builder /target /app/public

# Supervisor
COPY assets/web/supervisord.conf /etc/supervisord.conf

# Entrypoint (do not define in dev environment)
ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]
