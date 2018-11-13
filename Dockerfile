FROM node:8-alpine
MAINTAINER d.kramer@soton.ac.uk

RUN apk add --update build-base python hugo

RUN adduser -D -h /home/term -s /bin/sh term && \
    ( echo "term:term" | chpasswd ) && \
	apk add openssh-client
EXPOSE 3000

WORKDIR /app

CMD yarn --dev && hugo && node bin
