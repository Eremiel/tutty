FROM node:8-alpine
MAINTAINER d.kramer@soton.ac.uk

RUN apk add --update build-base python hugo bash

COPY terminal/prompt.sh /etc/profile.d/prompt.sh
COPY terminal/motd /etc/motd

EXPOSE 3000

WORKDIR /app

CMD yarn --dev && hugo && node bin
