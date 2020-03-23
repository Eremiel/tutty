FROM debian
LABEL maintainer="d.kramer@soton.ac.uk"

RUN apt-get update -y && \
    apt-get install -y supervisor python bash git nano vim openssh-server && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq libnss-ldap && \
    mkdir -p /run/sshd && \
    rm -rf /var/lib/apt/lists/*

COPY assets/backend/prompt.sh /etc/profile.d/prompt.sh
COPY assets/backend/env.sh /etc/profile.d/env.sh
COPY assets/backend/motd /etc/motd
COPY assets/backend/bashrc /etc/skel/.bashrc
COPY assets/backend/nsswitch.conf /etc/nsswitch.conf
COPY assets/backend/libnss-ldap.conf /etc/libnss-ldap.conf

# Setup host authentication
COPY assets/backend/shosts.equiv /etc/ssh/shosts.equiv
COPY assets/backend/netgroup /etc/netgroup

EXPOSE 3000

WORKDIR /root

COPY assets/backend/supervisord.conf /etc/supervisord.conf
COPY assets/backend/sshd_config /etc/ssh/sshd_config

# Automatically create home directories
RUN echo "session    required   pam_mkhomedir.so skel=/etc/skel/ umask=0022" >> /etc/pam.d/common-account 

ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]
