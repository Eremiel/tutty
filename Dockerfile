# --- build Quantum Espresso ---
FROM alpine:3.8 as qe-builder

RUN apk add --update gfortran make git tar
RUN git clone https://gitlab.com/QEF/q-e.git
WORKDIR /q-e
RUN ./configure LDFLAGS="-static-libgfortran -static-libgcc -Bstatic"
RUN make all


FROM node:8-alpine
MAINTAINER d.kramer@soton.ac.uk

RUN apk add --update build-base python hugo bash git nano vim

COPY terminal/prompt.sh /etc/profile.d/prompt.sh
COPY terminal/motd /etc/motd

EXPOSE 3000

WORKDIR /app

CMD yarn --dev && hugo && node bin
