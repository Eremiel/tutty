#!/bin/sh
# This container creates a new Certificate Authority and store the corresponding files
#
# Usage: 
#
#      docker run -v $(pwd):/data
#
#      docker run -v $(pwd):/data -e HOSTS="myhost1 myhost2"
#
# The container will:
#
# 1) Create a CA if needed; if ca.pem and ca-key.pem are present in the /data folder. These
#    will be used, otherwise a new CA will be created and ca.pem and ca-key.pem written.
#
# 2) If checks for each host (environment varialbe HOSTS) if host-keys are present in the folder /data/keys. 
#    The naming convention is "ssh_${HOST}_rsa_key" and "ssh_${HOST}_rsa_key.pub". If these do not exist, 
#    they are created.
#
# 3) It creates a signed public certificate for each host key and stores it in "ssh_${HOST}_rsa_key-cert.pub".
#    This is done even if the certificate file exists, overwriting existing certificates, to ensure that
#    expired certificates are renewed. A certificate is valid for 52 weeks.
#
# ----------------------------------------------------------------------------------------------------------------
FROM debian:latest

RUN apt-get update -y && \
    apt-get install -y openssl openssh-client && \
    rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

# A list of all hosts that need signed host-keys
ENV HOSTS="backend web"

WORKDIR /data

ENTRYPOINT [ "/entrypoint.sh" ]